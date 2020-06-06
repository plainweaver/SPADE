/**
 * Array < Array < start: number | null, end: number | null > >
 * if start is null, it counts from back to front, reversely.
 * if end is null, it points to the end.
 */
class Divider {

}

class Definition {
  /**
   * @param divider - chunks part out so it could be defined
   * @param tag - utf-8 string tag describes divided part
   * @param uudi - universal unique definition identifier
   */
  constructor(divider, tag, uudi) {
    if (!(divider instanceof Divider)) throw new TypeError('divider must be instance of Divider.');
  }
}

// A transport contains one data part.
class Transport {
  constructor() {
    this.size = 0; // header size

    this.divs = []; // dividers
    this.defs = []; // definitions
    this.udis = []; // universal definition identifiers

    // this.packets = [
    //   [16, 'Source port'], [16, 'Destination Port'],
    //   [32, 'Sequence number'], [32, 'Acknowledgment number'],
    //   [4, 'Data']
    // ];
  }
}

class TransportBuilder {
  createTransport(action, options) {

  }

  updateTransport(id, action, options) {

  }

  removeTransport(id) {

  }

  listTransports() {

  }
}

export default TransportBuilder;
