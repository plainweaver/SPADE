import System from '../src/system';
import config from '../server.config';

const system = new System({ config: config });

// system.init().then(s => console.log(s))

function some() {
  console.log(this);
}

some();