const os = require('os');

const cliConfigPath = `${os.homedir()}/.viewar-cli`;
const defaultCliConfig = {
  users: {},
  overrides: {},
};

const projectTypes = {
  'Vanilla Javascript': 'vanilla',
  React: 'react',
  'Sample project': 'sample',
};

const sampleProjects = {
  'Base6 (Furniture Live, Products Live, WallArt)': 'base6',
  'QR Navigation': 'qrnavigation',
  'Vanilla sample': 'vanilla',
  'Helpar Object Tracking': 'helpar-objecttracking',
  'Helpar Remote Assistance': 'helpar-remote-assistance',
  'Other...': 'other',
};

module.exports = {
  cliConfigPath,
  defaultCliConfig,
  projectTypes,
  sampleProjects,
};
