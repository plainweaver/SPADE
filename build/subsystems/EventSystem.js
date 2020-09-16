"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _events = require("events");

var _subleveldown = _interopRequireDefault(require("subleveldown"));

var _levelConcatIterator = _interopRequireDefault(require("level-concat-iterator"));

var _levelSecondIndex = _interopRequireDefault(require("../../utils/level-second-index"));

var _levelSyncCache = _interopRequireDefault(require("../../utils/level-sync-cache"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// finder, performer, scheduler
class EventSystem extends _events.EventEmitter {
  constructor(self) {
    super();
    this.ready = false; // for schedules that are fired before conditions are fully loaded.

    this.queue = [];
    process.nextTick(() => {
      this.shard = self.shard;
      this.particle = self.particle;
      this.action = self.action;
      this.domain = self.domain;
    });
    setImmediate(() => {
      // { nodes: Array, edges: Array, createdAt: Date }
      this.shape = (0, _levelSecondIndex.default)((0, _subleveldown.default)(this.particle.abstract, 'event.node'), {
        primaryIndex: null
      });
      this.schedule = (0, _levelSyncCache.default)((0, _subleveldown.default)(this.particle.abstract, 'event.schedule'));
      this.log = (0, _subleveldown.default)(this.particle.abstract, 'event.log'); // eval-able scripts.

      this.script = (0, _subleveldown.default)(this.particle.abstract, 'event.script'); // condition: Function    input: type: String, data: Buffer    output: shapeId to trigger

      this.condition = []; // load all when the system starts.

      (async () => {
        const scripts = await (0, _levelConcatIterator.default)(this.script);
        scripts.forEach(s => this.condition.push(eval(s)));
        this.ready = true;
        this.queue.forEach(([type]) => {
          process();
        });
      })();
    });
  } // type: String, indicates whether it is for action or domain
  // name: String, name for the condition function
  // script: String, eval-able js script


  async createCondition(type, name, script) {
    let func;

    try {
      func = eval(script);
    } catch (e) {
      throw new Error('Invalid script was given.');
    }

    await this.script.put(name, script);
    this.condition[name] = func;
    return name;
  }

  async removeCondition(name) {
    if (this.condition[name]) {
      delete this.condition[name];
    }

    await this.script.del(name);
  }
  /**
   * Creates a shape. It connects nodes (action and domain) with edges.
   * @param nodes {Array< Object
   *   { id: Number, (starting: true), condition: { action, domain } or Function(script) }
   * >}
   * @param edges {Array< Object { from: nodeId, to: nodeId, required: boolean } >}
   * @return shapeId {Number}
   */


  async createShape(nodes, edges) {
    (function validate() {
      // no mulitple starting nodes
      let startings = 0;
      nodes.forEach(n => {
        if (n.starting) startings += 1;
      });
      if (startings !== 1) throw new Error('No multiple starting nodes are allowed.'); // no multiple same nodes

      nodes.forEach(n => {
        let count = 0;
        nodes.forEach(n2 => {
          if (n2.id === n.id) count += 1;
        });
        if (count > 1) throw new Error('No multiple same nodes are allowed.');
      }); // no wrong-pointing edges

      const nodeids = [];
      edges.forEach(e => {
        if (!nodeids.includes(e.from)) nodeids.push(e.from);
        if (!nodeids.includes(e.to)) nodeids.push(e.from);
      });
      nodeids.forEach(p => {
        if (!nodes.find(p)) throw new Error('No node is found that edge is pointing.');
      }); // no multiple same edges

      edges.forEach(e => {
        let found = 0;
        edges.forEach(e2 => {
          if (e2.from === e.from && e2.to === e.to) {
            found += 1;
          }
        });
        if (found > 1) throw new Error('No multiple same edges are allowed.');
      });
    })();

    const shape = {
      nodes,
      edges
    }.toString();
    return await this.shape.putIndexedObject(shape);
  }

  async removeShape(id) {
    return await this.shape.delByPrimaryValue(id);
  }
  /**
   * createSchedule(start, end, interval)(event)
   * @param start - Date time when schedule starts
   * @param end - optional, Date time when schedule forcefully stops
   */


  async setScheduleAtDate(start, end) {
    if (start < Date.now()) throw new Error();
    await this.schedule.put({
      type: 'date',
      start: start,
      end: end
    });
  }
  /**
   * @param delay - milliseconds from when system started
   * @return {Promise<void>}
   */


  async setScheduleWithDelay(delay, condition) {
    return await this.schedule.put({
      type: 'delay',
      delay: delay
    });
  } // trigger new schedule by conditioning data that is passed to process


  async setScheduleByProcess(scriptName) {
    return await this.schedule.put();
  }

  async removeScheduleByProcess(scriptName) {
    await this.schedule.del(scriptName);
  }

  async removeSchedule(id) {
    await this.schedule.del(id);
  }

  emit(eventName, ...args) {
    if (!this.ready) {
      this.queue.push([eventName, ...args]);
      return;
    } // todo


    this.shard.process();
    this.particle.process();
  } // type: String 'action' or 'domain', data: function or object


  process(type, data) {
    // todo
    this.emit('process', type, data);
  }

}

exports.default = EventSystem;
//# sourceMappingURL=EventSystem.js.map