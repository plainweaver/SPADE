import fs from 'fs';
import storages from './storages';
import autokey from '../../utils/level-auto-inc/autokey';

const DirCorruptedError = new Error('Your directory has been corrupted. You might have terminated unexpectedly during an initialization.');

function createDirsIfNotExist(dirs) {
  if (typeof dirs === 'object') {
    dirs = Object.values(dirs);
  }

  const alreadyExists = dirs.filter(dir => fs.existsSync(dir));

  if (alreadyExists.length > 0) {
    if (alreadyExists.length < dirs.length) {
      throw DirCorruptedError;
    }

    return alreadyExists;
  }

  return dirs.map(dir => fs.mkdirSync(dir, { recursive: true }));
}


async function createMinLengthForId(storage, config) {
  // await storage.put('minLengthForId', config.idGenerator.minLength);
}

async function createDomainsForNames(storage) {
  await storage.createDomain({ name: 'identity' });
  const name = await storage.createDomain({ name: 'name' });

  const momentary = await storage.createSubDomain({ name: 'momentary' }, name);
  const permanent = await storage.createSubDomain({ name: 'permanent' }, name);
  const unique = await storage.createSubDomain({ name: 'unique' }, name);
  const shared = await storage.createSubDomain({ name: 'shared' }, name);

  // await storage.disableSymmetricDifference(momentary, unique);
  // await storage.disableSymmetricDifference(momentary, shared);
  // await storage.disableSymmetricDifference(permanent, unique);
  // await storage.disableSymmetricDifference(permanent, shared);
  // await storage.enableIntersection(momentary, unique);
  // await storage.enableIntersection(momentary, shared);
  // await storage.enableIntersection(permanent, unique);
  // await storage.enableIntersection(permanent, shared);

  await storage.disableComplement(name);

  await storage.leaveIntersectionOnly(momentary, unique);
  await storage.leaveIntersectionOnly(momentary, shared);
  await storage.leaveIntersectionOnly(permanent, unique);
  await storage.leaveIntersectionOnly(permanent, shared);
}

async function createCounters(storage) {
  return Promise.all([
    autokey(storage, { counterName: 'counterForCell' }).createCounter(),
    autokey(storage, { counterName: 'counterForType' }).createCounter(),
    autokey(storage, { counterName: 'counterForEmission' }).createCounter(),
    autokey(storage, { counterName: 'counterForResolution' }).createCounter(),
    autokey(storage, { counterName: 'counterForRejection' }).createCounter(),
  ]);
}

async function setActionsOfDomains(storage) {
  const permanent = await storage.getDomainIdsByName('permanent');
  const momentary = await storage.getDomainIdsByName('momentary');
  const unique = await storage.getDomainIdsByName('unique');
  const shared = await storage.getDomainIdsByName('shared');

  function createSimpleDiscriminator(typeName) {
    return function({ data, info }) {
      if (!Array.isArray(info.type)) info.type = [ info.type ];
      return info.type.includes(typeName);
    }
  }

  console.log(permanent);
  await storage.setDomainDiscriminator(permanent, createSimpleDiscriminator('permanent'));
  await storage.setDomainDiscriminator(momentary, createSimpleDiscriminator('momentary'));
  await storage.setDomainDiscriminator(unique, createSimpleDiscriminator('unique'));
  await storage.setDomainDiscriminator(shared, createSimpleDiscriminator('shared'));
}

async function createBootstrapAdmin(self) {
  // return await self.emit('register_identity', self.config.identity_admin);
}

export default async function init() {
  const self = this;

  createDirsIfNotExist(self.config.storage.location);

  this.storageForEtc = storages.forEtc(this);
  this.storageForParticles = storages.forParticles(this);
  this.storageForDomains = storages.forDomains(this);
  this.storageForLogs = storages.forLogs(this);

  await new Promise((res, rej) => {
    const { storageForEtc, storageForDomains } = self;

    storageForEtc.get('initialized', async (err, value) => { // Can be removed. Just making sure initialization was successful.
      if (err && err.name !== 'NotFoundError') rej(err);

      if (!value) {
        console.log('Initializing for the first time.');
        await createCounters(storageForEtc);
        await createMinLengthForId(storageForEtc, self.config.storage);
        await createDomainsForNames(storageForDomains);
        await setActionsOfDomains(storageForDomains);
        await createBootstrapAdmin(self);
        await storageForEtc.put('initialized', true);
      }

      res();
    });
  })
}
