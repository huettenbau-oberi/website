import * as migration_20260517_200133 from './20260517_200133';

export const migrations = [
  {
    up: migration_20260517_200133.up,
    down: migration_20260517_200133.down,
    name: '20260517_200133'
  },
];
