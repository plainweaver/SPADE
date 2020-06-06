import fs from 'fs';
import AuthServer from '../build/index';
import config from '../server.config';
import run from './run';

async function start() {
  if (!fs.existsSync(config.db_base_path)) {
    fs.mkdirSync(config.db_base_path);
  }

  const server = new AuthServer(config);

  await run(server.init.bind(server));
  await run(server.launch.bind(server));
}

export default start;
