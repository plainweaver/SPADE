import fs from 'fs';

let length;

export default async function generateId(checkIdExists) {
  const filePath = this.config.gen_id_file_path;
  const minLength = this.config.gen_id_min_length || 4;

  if (!filePath) {
    throw new Error('this.config.gen_id_file_path missing');
  }

  if (!length) {
    try {
      length = parseInt(fs.readFileSync(filePath));
    } catch (e) {
      if (e.code && e.code === 'ENOENT') { // file not found
        fs.writeFileSync(filePath, minLength);
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
        fs.writeFileSync(filePath, length + 1);
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
};
