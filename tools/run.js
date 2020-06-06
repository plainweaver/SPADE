
export function format(time) {
  return time.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');
}

function run(fn, options) {
  const task = typeof fn.default === 'undefined' ? fn : fn.default;
  const start = new Date();
  console.info(
    `\x1b[32m [${format(start)} : ${task.name.charAt(0).toUpperCase() +
      task.name.slice(1)}] \x1b[0mProcess started ${options ? `with ${typeof options}` : ''}\x1b[0m`,
  );
  return task(options).then(resolution => {
    const end = new Date();
    const time = end.getTime() - start.getTime();
    console.info(
      `\x1b[32m [${format(end)} : ${task.name.charAt(0).toUpperCase() +
        task.name.slice(1)}] \x1b[0mProcess finished \x1b[0m(${time}ms)`,
    );
    return resolution;
  });
}

if (require.main === module && process.argv.length > 2) {
  // eslint-disable-next-line no-underscore-dangle
  delete require.cache[__filename];

  // eslint-disable-next-line import/no-dynamic-require
  const module = require(`./${process.argv[2]}.js`).default;

  run(module).catch(err => {
    console.error(err.stack);
    process.exit(1);
  });
}

export default run;
