import Promise from 'bluebird';

export default async function (overlays) {
  const systemProxy = this.createRecorder();
  return await Promise.map(overlays, p => p.call(systemProxy));
};
