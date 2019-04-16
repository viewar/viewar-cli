import fs from 'fs';
import archiver from 'archiver';

export default (dirPath, zipPath) => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);

    output.on('close', resolve);
    output.on('error', reject);

    const archive = archiver('zip', {});
    archive.pipe(output);
    archive.directory(dirPath, false);
    archive.finalize();
  });
};
