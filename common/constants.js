const os = require('os')

const cliConfigPath = `${os.homedir()}/.viewar-cli`
const defaultCliConfig = {
  users: {},
  overrides: {},
}
const repositoryUrl = 'https://github.com/viewar/viewar-boilerplate.git'

const projectTypes = {
  'Vanilla Javascript': 'vanilla',
  'React': 'react',
  'Sample project': 'sample',
}

const sampleProjects = {
  'Base6': 'base6',
  'QR Navigation': 'qrnavigation',
  'Vanilla sample': 'vanilla',
  'Helpar Object Tracking': 'helpar-objecttracking',
  'Other...': 'other',
}

module.exports = {
  cliConfigPath,
  defaultCliConfig,
  repositoryUrl,
  projectTypes,
  sampleProjects,
}
