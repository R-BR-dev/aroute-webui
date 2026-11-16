#!/bin/sh
# Build the aroute-webui RPM inside a Fedora container:
#   podman run --rm -v "$PWD:/src" -w /src --security-opt label=disable \
#       registry.fedoraproject.org/fedora:44 sh packaging/build-rpm.sh
# Results land in dist/. Publishing to repo.rnbr-dev.com is deliberately manual.
set -eu
SRC="$(cd "$(dirname "$0")/.." && pwd)"
NAME=aroute-webui
SPEC="$SRC/packaging/rpm/$NAME.spec"

dnf -y install nodejs-npm git-core rpm-build rpmlint xz >/dev/null

TARBALL="$(sh "$SRC/scripts/make-dist.sh" "$SRC/dist")"
echo "==> source tarball: $TARBALL"

# The version is stated in package.json and in the spec; refuse to build if they differ.
VERSION="$(basename "$TARBALL" .tar.xz | sed "s/^$NAME-//")"
SPEC_VERSION="$(sed -n 's/^Version:[[:space:]]*//p' "$SPEC")"
if [ "$VERSION" != "$SPEC_VERSION" ]; then
	echo "version mismatch: package.json has $VERSION, $SPEC has $SPEC_VERSION" >&2
	exit 1
fi

TOP="$(mktemp -d)"
mkdir -p "$TOP/SOURCES" "$TOP/SPECS"
cp "$TARBALL" "$TOP/SOURCES/"
cp "$SPEC" "$TOP/SPECS/"

rpmbuild --define "_topdir $TOP" -ba "$TOP/SPECS/$NAME.spec"

find "$TOP/RPMS" "$TOP/SRPMS" -name '*.rpm' -exec cp {} "$SRC/dist/" \;
echo "==> built:"
ls -1 "$SRC/dist/$NAME-$VERSION"-*.rpm

echo "==> rpmlint"
rpmlint "$SRC/dist/$NAME-$VERSION"-*.rpm || true

echo "==> install test"
dnf -y install "$SRC/dist/$NAME-$VERSION"-*.noarch.rpm >/dev/null
rpm -ql "$NAME"
test -f /usr/share/aroute/webui/index.html
