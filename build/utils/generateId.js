"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = generateId;

var _fs = _interopRequireDefault(require("fs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let length;

async function generateId(checkIdExists) {
  const filePath = this.config.gen_id_file_path;
  const minLength = this.config.gen_id_min_length || 4;

  if (!filePath) {
    throw new Error('this.config.gen_id_file_path missing');
  }

  if (!length) {
    try {
      length = parseInt(_fs.default.readFileSync(filePath));
    } catch (e) {
      if (e.code && e.code === 'ENOENT') {
        // file not found
        _fs.default.writeFileSync(filePath, minLength);

        length = minLength;
      } else {
        throw e;
      }
    }
  }

  const generate = async () => {
    const id = Math.floor(Math.random() * Math.pow(10, length));

    try {
      const exist = await checkIdExists;

      if (exist) {
        _fs.default.writeFileSync(filePath, length + 1);

        length += 1;
        return await generate();
      }
    } catch (e) {
      if (e.name === 'NotFoundError') {
        return id;
      } else {
        throw e;
      }
    }
  };

  return await generate();
}

;
//# sourceMappingURL=generateId.js.map