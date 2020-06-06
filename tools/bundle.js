import cp from 'child_process';
import { promisify } from 'util';

async function bundle() {
  await promisify(cp.exec)('babel src --out-dir build -s');
}

export default bundle;
