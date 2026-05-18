import * as migration_20260517_200133 from './20260517_200133';
import * as migration_20260518_180631 from './20260518_180631';

export const migrations = [
  {
    up: migration_20260517_200133.up,
    down: migration_20260517_200133.down,
    name: '20260517_200133',
  },
  {
    up: migration_20260518_180631.up,
    down: migration_20260518_180631.down,
    name: '20260518_180631'
  },
];
