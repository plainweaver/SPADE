import rimraf from 'rimraf';
import { promisify } from 'util';

/**
 * Cleans up the output (build) directory.
 */
function clean() {
  return promisify(rimraf)('build', {
    glob: {
      nosort: true,
      dot: true,
      ignore: ['build/.git'],
    }
  });
}

export default clean;
