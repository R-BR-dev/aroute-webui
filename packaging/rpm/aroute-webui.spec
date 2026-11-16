# ARoute Web-UI: the browser interface, as static files that arouted serves.
#
# Dependencies come from the npm registry during %%build, so the build needs
# network access (plain rpmbuild in a container, see packaging/build-rpm.sh).
# package-lock.json pins every version.

Name:           aroute-webui
Version:        0.0.1
Release:        1%{?dist}
Summary:        ARoute router web interface
License:        GPL-3.0-only
URL:            https://github.com/R-BR-dev/aroute-webui
Source0:        %{url}/releases/download/v%{version}/%{name}-%{version}.tar.xz
BuildArch:      noarch

# Fedora's default Node.js. The minimum version is in package.json ("engines").
BuildRequires:  nodejs-npm

# arouted (aroute-core) serves these files from %%{_datadir}/aroute/webui.
# A weak dependency, so the package also installs where the Core is not
# available from a repository, as in the build container's install test.
Recommends:     aroute-core

%description
ARoute turns an x86_64 computer into a router that sends traffic through
several VPN and proxy uplinks according to rules.

This package contains the web interface: a single-page application that the
arouted daemon serves on the router's address.

%prep
%autosetup

%build
npm ci --no-audit --no-fund
npm run build

%install
install -dm 0755 %{buildroot}%{_datadir}/aroute/webui
cp -a build/. %{buildroot}%{_datadir}/aroute/webui/

%check
npm test

%files
%license LICENSE
%doc README.md
%dir %{_datadir}/aroute
%{_datadir}/aroute/webui/

%changelog
* Mon Nov 16 2026 ARoute project - 0.0.1-1
- Application skeleton: login page, dashboard with system information.
- English and Russian interface.
