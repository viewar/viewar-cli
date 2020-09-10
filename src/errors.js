export const getErrorMessage = (error, appId, appVersion, fallbackMessage) => {
  switch (error) {
    case 100:
      return 'Authentication failed.';
    case 101:
      return `Version '${appVersion}' for '${appId}' already exists. Use --force to override.`;
    case 101:
      return `App '${appId}' not found.`;
    case 200:
    default:
      return fallbackMessage ? fallbackMessage : 'Unknown error.';
  }
};
