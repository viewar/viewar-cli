# ViewAR SDK Command Line Interface

## Getting Started

Before installing the developer tools, you'll need to make sure that you have two prerequisites installed:

- Node.js version 6.0.0 or higher
- `yarn` or `npm` (>= v3.0.0) package managers

Next, install the ViewAR CLI – a command-line tool that generates basic boilerplates of new projects with examples.

```
npm install -g viewar-cli
```

or

```
yarn global add viewar-cli
```

You'll only need to install this CLI once. It will alert you when it's out of date, and provide instruction on how to update it.

Once installed, the CLI can be used to create a new project by running

```
viewar-cli init PROJECT_NAME
```

where `PROJECT_NAME` is the name of your new application. Once it's been created and the dependencies are installed, change your working directory to `PROJECT_NAME`, and start the application server by running `npm start` (or `yarn start`).

When the server has booted, you can access your application by navigating to `http://localhost:8080/` in your web browser. Your application's code can be found in `src/index.js`, and you can learn more about available SDK features by diving into our documentation.
