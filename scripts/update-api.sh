#!/bin/sh
# Pin the Core API this UI is built against.
#
#   sh scripts/update-api.sh v0.1.0            a Core release on GitHub
#   sh scripts/update-api.sh ../aroute-core    a local Core checkout
#
# Copies the Core's openapi.json here, records where it came from in
# openapi.lock and regenerates src/api/schema.d.ts. Then run `npm run
# type-check`: every error is a place where the API changed under the UI.
set -eu
cd "$(dirname "$0")/.."

if [ $# -ne 1 ]; then
	echo "usage: $0 <core release tag | path to a Core checkout>" >&2
	exit 2
fi

if [ -d "$1" ]; then
	cp "$1/openapi.json" openapi.json
	SOURCE="aroute-core $(git -C "$1" describe --tags --always --dirty 2>/dev/null || echo "at $1")"
else
	curl -fsSL -o openapi.json \
		"https://github.com/R-BR-dev/aroute-core/releases/download/$1/openapi.json"
	SOURCE="aroute-core $1"
fi

cat > openapi.lock <<EOF
# The Core API this UI is built against.
# Written by scripts/update-api.sh; do not edit by hand.
core_version = $(node -p 'require("./openapi.json").info.version')
source = $SOURCE
sha256 = $(sha256sum openapi.json | cut -d' ' -f1)
EOF

npm run --silent api:generate
cat openapi.lock
