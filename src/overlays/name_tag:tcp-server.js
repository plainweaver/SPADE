import net from 'net';

export const requires = [ 'recursion' ];

export default function tcpServer (original, layers, receiver) {
  receiver.listen = function (port) {
    console.log('start listening');
    const server = new net.Server();
    server.listen(3000, () => console.log('listening'));
  };

  // this.overlays.layers.tcpServer = this;
}
