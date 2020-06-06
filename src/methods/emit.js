import * as listeners from '../listeners/index';

async function emit(eventName, ...data) {
  let result;

  try {
    await this.storageForLogs.emission.putWithAutoKey(JSON.stringify({
      eventName: eventName,
      arguments: data,
      emitted_at: this.getDate(),
    }));

    result = await listeners[eventName].call(this, ...data);

    await this.storageForLogs.resolution.putWithAutoKey(JSON.stringify({
      eventName: eventName,
      result,
      resolved_at: this.getDate(),
    }));
  } catch (e) {
    console.log(e);
    await this.storageForLogs.rejection.putWithAutoKey(JSON.stringify({
      eventName: eventName,
      rejected_at: this.getDate(),
      reason: e,
    }));
  }

  return result;
}

export default emit;
