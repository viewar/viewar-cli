# ViewAR SDK Command Line Interface

[![Build Status](https://travis-ci.com/viewar/viewar-cli.svg?&branch=master)](https://travis-ci.com/viewar/viewar-cli)
[![PRs Welcome][pr-welcome]](http://makeapullrequest.com)
[![Conventional Commits](https://img.shields.io/badge/✔-Conventional%20Commits-blue.svg)](https://conventionalcommits.org)

[pr-welcome]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg

## About

ViewAR CLI is a command line tool for managing ViewAR Apps creation and deployment. It may be used to initialize a boilerplate Vanilla JavaScript / React project or use one of ViewAR Templates.

## Getting Started

Before installing the developer tools, you'll need to make sure that you have two prerequisites installed:

- Node.js version 6.0.0 or higher
- `yarn` or `npm` (>= v3.0.0) package managers

Next, install the ViewAR CLI – a command-line tool that generates basic boilerplates of new projects with examples.

`npm install -g viewar-cli` or `yarn global add viewar-cli`

You only need to install the ViewAR CLI once. It will alert you when it's out of date, and provide instructions on how to update it.

Once installed, the CLI can be used to create a new project by running:

```
viewar-cli init PROJECT_NAME
```

where `PROJECT_NAME` is the name of your new application. Once it's been created and the dependencies are installed, change your working directory to `PROJECT_NAME`, and start the application server by running `npm start` (or `yarn start`).

When the server has booted, you can access your application by navigating to `http://localhost:8080/` in your web browser. Your application's code can be found in `src/index.js`, and you can learn more about available SDK features by diving into our documentation.

# Changelog

## [Unreleased]

### Added

- Filename changed from .viewar-config to viewar-config.json with backwards compatibility

## [0.13.3]

### Added

- Display app ID and vers ion after command "deploy".
- Appended changelog to README.

## [0.13.2]

### Fixed

- Display validation error message if incorrect App ID or Version string is entered.

## [0.13.1]

### Fixed

- Added a warning if no version is given with deploy.

## [0.13.0]

### Added

- Project type "Angular"

## [0.12.1]

### Added

- Remove zero-width space characters for pasted sample app custom repositories.
- Read template config for sample app custom repositories (github only).

### Changed

- Improved emoji output prints.

## [0.12.0]

### Added

- Added advanced error logging and server logging.
- Prettify output prints.

### Changed

- Improved .viewar-config generation (if npm install fails).
- Ask for another app ID if entered ID is already existing.

## [0.11.4]

### Fixed

- Correctly check for sample project/template selection.

## [0.11.3]

### Fixed

- Fixed logout command.

## [0.11.2]

### Fixed

- Major issues in code bundling.

## [0.11.1]

### Changed

- Display detailed login error message.

## [0.11.0]

### Changed

- Revamped code bundling.

## [0.10.3]

### Changed

- Renamed template section.

## [0.10.2]

### Fixed

- Use version 100 if no version is given as argument in command "deploy".

## [0.10.1]

### Fixed

- Fixed 'Vanilla Javascript' and 'React' project types.

## [0.10.0]

### Added

- Added GuideBOT Template

### Removed

- Removed alias generate-token (use generate only).

### Changed

- Renamed base6 sample to Furniture Live/Products Live/WallArt.

## [0.9.0]

### Added

- Added check if git is installed for init command.

## [0.8.4]

### Fixed

- Fixed missing variable error when deploying.

## [0.8.3] broken

### Added

- Check authentication before building an app with deploy.

## [0.8.2]

### Changed

- Split react and vanilla boilerplate apps into two separate repositories.

## [0.8.1]

### Added

- Show login when calling init with no previous logins.
- Sort account selection by name.
- Show app creation errors from server.

## [0.8.0]

### Added

- Check for correct node version.
- Read and use tracking config from template repository.

## [0.7.0]

### Added

- Show advanced error message when build directory does not exist while deploying.

## [0.6.0]

### Added

- Placenote tracker
- Remote tracker
- Helpar sample

## [0.5.0]

### Added

- Added version check and notification if out ouf date.
- Added alias 'viewar'.

### Changed

- Changed init command to take project name as first, project type as second and user as third argument.
