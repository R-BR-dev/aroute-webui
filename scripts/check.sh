#!/bin/sh
# API pin, formatting, lint, type-check, tests and build: exactly what CI runs.
#
# Needs the dependencies installed (`npm ci`). To run it with CI's Node.js
# without installing anything on the host:
#   podman run --rm -v "$PWD:/src" -w /src --security-opt label=disable \
#       registry.fedoraproject.org/fedora:44 \
#       sh -c 'dnf -y install nodejs-npm >/dev/null && npm ci && sh scripts/check.sh'
set -eu
cd "$(dirname "$0")/.."

# openapi.json is the copy that scripts/update-api.sh pinned, and the generated
# types were made from it.
echo "$(sed -n 's/^sha256 = //p' openapi.lock)  openapi.json" | sha256sum --check --quiet
npm run --silent api:check

npm run --silent format:check
npm run --silent lint
npm test
npm run --silent build
