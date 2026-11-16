#!/bin/sh
# Create dist/aroute-webui-<version>.tar.xz and print its path.
#
# A clean checkout is packed from git HEAD. With uncommitted changes (or without
# git) the working tree is packed instead, so a local build contains what is on
# disk; a notice on stderr says so.
set -eu
TOP="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="$(sed -n 's/^  "version": "\(.*\)",$/\1/p' "$TOP/package.json" | head -1)"
NAME="aroute-webui-$VERSION"
OUT="${1:-$TOP/dist}"
mkdir -p "$OUT"

if git -C "$TOP" rev-parse --verify HEAD >/dev/null 2>&1 \
	&& [ -z "$(git -C "$TOP" status --porcelain)" ]; then
	git -C "$TOP" archive --format=tar --prefix="$NAME/" HEAD | xz -T0 > "$OUT/$NAME.tar.xz"
elif git -C "$TOP" rev-parse --git-dir >/dev/null 2>&1; then
	echo "make-dist: uncommitted changes, packing the working tree" >&2
	# Tracked files plus untracked ones that .gitignore does not exclude.
	git -C "$TOP" ls-files -co --exclude-standard -z \
		| tar -C "$TOP" --null -T - --ignore-failed-read --transform "s|^|$NAME/|" -cf - \
		| xz -T0 > "$OUT/$NAME.tar.xz"
else
	echo "make-dist: no git repository, packing the working tree" >&2
	tar -C "$TOP" --transform "s|^\./|$NAME/|" \
		--exclude='./node_modules' --exclude='./build' --exclude='./dist' --exclude='./.git' \
		-cf - . | xz -T0 > "$OUT/$NAME.tar.xz"
fi
echo "$OUT/$NAME.tar.xz"
