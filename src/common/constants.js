const os = require('os');

export const cliConfigPath = `${os.homedir()}/.viewar-cli`;

export const defaultCliConfig = {
  users: {},
  overrides: {},
};

export const projectTypes = {
  'Vanilla Javascript': 'vanilla',
  React: 'react',
  Angular: 'angular',
  'Sample Project/Template': 'sample',
};

export const sampleProjects = {
  'Base6 (Furniture Live, Products Live, WallArt)': 'base6',
  GuideBOT: 'guidebot',
  'QR Navigation': 'qrnavigation',
  'Vanilla sample': 'vanilla',
  'Helpar Object Tracking': 'helpar-objecttracking',
  'Helpar Remote Assistance': 'helpar-remote-assistance',
  'Other...': 'other',
};
