/**
 * Check if file exists before accessing it. Returns undefined if file does not exist.
 * Mainly used for server logging upon exception (without throwing a new exception).
 */
export const readJsonSafe = filename => {
  try {
    if (fs.existsSync(path)) {
      return JSON.parse(fs.readFileSync(filename, 'utf8'));
    } else {
      return undefined;
    }
  } catch (error) {
    return undefined;
  }
};
