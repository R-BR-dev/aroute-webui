# aroute-webui

The browser interface of [ARoute](https://github.com/R-BR-dev): a router for x86_64 machines that sends
traffic through several VPN and proxy uplinks according to rules.

It is a single-page application built into static files. The Core daemon (`arouted`, from
[aroute-core](https://github.com/R-BR-dev/aroute-core)) serves them and answers the API they call.

_Status: milestone M0 — a walking skeleton. A login page and a dashboard that shows the Core's
`system/info`. The Core has no authentication yet, so the login page accepts any password._

## Layout

```
src/
├── api/           schema.d.ts (generated from openapi.json), the typed client, one file per API area
├── pages/         one component per screen: LoginPage, DashboardPage
├── components/    parts shared between pages: AppLayout (top bar), LanguageSwitch
├── stores/        client-side state (Pinia): the session
├── locales/       interface texts: en.json, ru.json
├── utils/         small pure functions
├── router.ts      routes and the signed-in guard
├── app.ts         puts the application together: root component and plugins
└── main.ts        mounts it into index.html
mock/              stand-in for the Core during development
packaging/         RPM spec, container build script
scripts/           check.sh (what CI runs), update-api.sh, make-dist.sh
openapi.json       the Core's API description, at the version this UI is built against
openapi.lock       which Core version that is
```

Data from the Core is server state and lives in TanStack Query (`src/api/`); Pinia stores hold only
what belongs to the browser. Components come from [PrimeVue](https://v4.primevue.org) **4**, the last
MIT-licensed line — PrimeVue 5 is under a commercial licence and must not be pulled in.

## Developing

Node.js 22.22 or newer. Fedora 44's own package is what CI and the RPM build use:

```bash
sudo dnf install nodejs-npm
```

```bash
npm ci
```

Without a router — the API is answered from `openapi.json` by a mock built into the dev server:

```bash
npm run dev:mock
```

Against a running Core (by default `http://127.0.0.1:8080`; set `AROUTE_CORE_URL` for another address):

```bash
npm run dev
```

Both open on <http://localhost:5173> and reload as files change.

To see the result the way a router serves it, build and point the Core at the output:

```bash
npm run build
```

```bash
cargo run -p arouted -- --socket "$XDG_RUNTIME_DIR/aroute.sock" --webui-dir /path/to/aroute-webui/build
```

### The mock

`mock/openapi-mock.ts` answers every operation in `openapi.json` with an example built from its
response schema, so a new endpoint is mocked as soon as the API description is updated. Where the
description has no example, `mock/overrides.ts` supplies realistic values. The mock keeps no state.

## The API pin

The UI is built against one version of the Core API. `openapi.json` is a copy of that version's
description, `openapi.lock` records where it came from, and `src/api/schema.d.ts` is generated from it.
To move to another Core version:

```bash
sh scripts/update-api.sh v0.1.0
```

(or the path of a local Core checkout instead of a tag), then:

```bash
npm run type-check
```

Every error is a place where the API changed under the UI. Commit the three files together.

## Checks

```bash
sh scripts/check.sh
```

verifies the API pin, formatting (Prettier), lint (ESLint), types and unit tests (Vitest), and builds
the app — the same script CI runs. `npm run format` fixes formatting.

## Contributing

- Branch from `main`, keep the branch short-lived, and run `sh scripts/check.sh` before opening a
  pull request.
- Every text the user sees goes into **both** `src/locales/en.json` and `ru.json`; a test fails when
  their keys differ.
- Do not edit `openapi.json` or `src/api/schema.d.ts` by hand. API changes are made in aroute-core and
  arrive here through `scripts/update-api.sh`.
- Design decisions and the roadmap live in [aroute-docs](https://github.com/R-BR-dev/aroute-docs).

## Packaging

```bash
podman run --rm -v "$PWD:/src" -w /src --security-opt label=disable registry.fedoraproject.org/fedora:44 sh packaging/build-rpm.sh
```

builds `aroute-webui-<version>.noarch.rpm` and the source RPM into `dist/`, runs rpmlint and an install
test. The package installs the app to `/usr/share/aroute/webui`, where `arouted` looks for it. A clean
checkout is packaged from git `HEAD`; with uncommitted changes the working tree is packaged instead.
Signing and publishing to <https://repo.rnbr-dev.com> are manual.

The version is stated in `package.json` and in `packaging/rpm/aroute-webui.spec`; the build script
refuses to continue if they differ.

## License

GPL-3.0-only. See [LICENSE](LICENSE).
