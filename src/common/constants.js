const os = require('os');

export const cliConfigPath = `${os.homedir()}/.viewar-cli`;

export const defaultCliConfig = {
  users: {},
  overrides: {},
};

export const projectTypes = {
  'Vanilla Javascript': 'vanilla',
  React: 'react',
  'Sample Project/Template': 'sample', // Also change "when" clause in init's "Select a template project" if we rename the sample project type.
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
