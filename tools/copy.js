import fs from 'fs';
import pkg from '../package.json';

const pkgJSON = JSON.stringify(
  {
    private: true,
    engines: pkg.engines,
    dependencies: pkg.dependencies,
    scripts: {
      start: 'node server.js',
    },
  },
  null,
  2,
);

/**
 * Copies static files such as robots.txt, favicon.ico to the
 * output (build) folder.
 */
async function copy() {
  fs.writeFileSync('build/package.json', pkgJSON);
  fs.copyFileSync('package-lock.json', 'build/package-lock.json');
  fs.copyFileSync('license.txt', 'build/license.txt');
}

export default copy;
