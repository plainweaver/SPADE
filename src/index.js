import recursion from './overlays/name_tag:recursion';
import tcpServer from './overlays/name_tag:tcp-server';
import tcpAnalyzer from './overlays/name_tag:tcp-analyzer';
import tcpUtility from './overlays/name_tag:tcp-utility';

export const System = require('./System').default;

/**
 * A shape of system recommended as default.
 * If you are a system builder, please modify as you want by importing from './System'.
 *
 * Hardcoded in (sub)system mean it's standardized.
 * Written here means it's in level of proposal or free to change.
 */
export default (async function () {
  const system = new System();

  await system.receptor(receiver => {
    receiver
      .use(recursion);

    receiver
      .use(tcpServer) // ≈ system.shard.createProtocol(...)
      .use(tcpAnalyzer({ port: 8000 }))
      .use(tcpUtility({ port: 9000 }));

    receiver.main = system.shard.listen;
  });

  return await system();
})();
