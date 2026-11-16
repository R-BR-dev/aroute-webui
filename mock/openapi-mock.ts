// A stand-in for the Core during UI development (`npm run dev:mock`).
//
// It answers every operation in the API description with an example built from
// the response schema, so a new endpoint is mocked as soon as openapi.json is
// updated. Values the description has no example for come from overrides.ts.
//
// It keeps no state: a POST changes nothing. Flows that need state (login,
// apply-and-confirm) have to run against a real Core.

import { readFileSync } from 'node:fs'
import { basename } from 'node:path'

import type { Plugin } from 'vite'

import { overrides } from './overrides.ts'

/** The parts of a JSON Schema this generator understands. */
interface Schema {
  $ref?: string
  type?: string | string[]
  example?: unknown
  default?: unknown
  enum?: unknown[]
  minimum?: number
  properties?: Record<string, Schema>
  items?: Schema
  allOf?: Schema[]
  oneOf?: Schema[]
  anyOf?: Schema[]
}

interface Operation {
  operationId?: string
  responses?: Record<string, { content?: Record<string, { schema?: Schema }> }>
}

interface Document {
  paths: Record<string, Record<string, Operation>>
  components?: { schemas?: Record<string, Schema> }
}

interface Route {
  method: string
  pattern: RegExp
  status: number
  body: unknown
}

const NOT_FOUND = { error: { code: 'not_found', message: 'No such API resource' } }

/** Builds a value that fits `schema`. `name` is the property being filled in. */
function exampleOf(schema: Schema, doc: Document, name: string): unknown {
  if (schema.$ref) {
    const target = doc.components?.schemas?.[schema.$ref.replace('#/components/schemas/', '')]
    return target ? exampleOf(target, doc, name) : null
  }
  if (schema.example !== undefined) return schema.example
  if (schema.default !== undefined) return schema.default
  if (schema.enum) return schema.enum[0]
  if (schema.allOf) {
    return Object.assign({}, ...schema.allOf.map((part) => exampleOf(part, doc, name)))
  }
  // `Option<T>` in the Core becomes `oneOf: [null, T]`: show the value, not the null.
  const variant = (schema.oneOf ?? schema.anyOf)?.find((option) => option.type !== 'null')
  if (variant) return exampleOf(variant, doc, name)

  const type = Array.isArray(schema.type) ? schema.type.find((t) => t !== 'null') : schema.type
  switch (type) {
    case 'object':
      return Object.fromEntries(
        Object.entries(schema.properties ?? {}).map(([key, property]) => [
          key,
          exampleOf(property, doc, key),
        ]),
      )
    case 'array':
      return schema.items ? [exampleOf(schema.items, doc, name)] : []
    case 'string':
      return name
    case 'integer':
    case 'number':
      return schema.minimum ?? 0
    case 'boolean':
      return false
    default:
      return null
  }
}

/** One route per operation, answering with its first successful response. */
function routesOf(doc: Document): Route[] {
  const routes: Route[] = []
  for (const [path, operations] of Object.entries(doc.paths)) {
    // `/devices/{id}` matches `/devices/anything`.
    const pattern = new RegExp(`^${path.replace(/\{[^}]+\}/g, '[^/]+')}$`)

    for (const [method, operation] of Object.entries(operations)) {
      const success = Object.entries(operation.responses ?? {}).find(([code]) =>
        code.startsWith('2'),
      )
      if (!success) continue
      const [code, response] = success

      const schema = response.content?.['application/json']?.schema
      let body = schema ? exampleOf(schema, doc, 'value') : undefined
      const override = operation.operationId && overrides[operation.operationId]
      if (override) body = { ...(body as object), ...override }

      routes.push({ method: method.toUpperCase(), pattern, status: Number(code), body })
    }
  }
  return routes
}

/** Vite plugin: serves `/api/**` from the OpenAPI document at `file`. */
export function openapiMock(file: string): Plugin {
  return {
    name: 'aroute-openapi-mock',
    configureServer(server) {
      const doc = JSON.parse(readFileSync(file, 'utf8')) as Document
      const routes = routesOf(doc)
      server.config.logger.info(`  mock API: ${routes.length} operation(s) from ${basename(file)}`)

      server.middlewares.use((req, res, next) => {
        const path = new URL(req.url ?? '/', 'http://mock').pathname
        if (!path.startsWith('/api/')) return next()

        // The Core serves its own description here; it is not an operation in it.
        const route =
          path === '/api/v1/openapi.json'
            ? { status: 200, body: doc }
            : routes.find((r) => r.method === req.method && r.pattern.test(path))

        res.statusCode = route?.status ?? 404
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(route ? route.body : NOT_FOUND))
      })
    },
  }
}
