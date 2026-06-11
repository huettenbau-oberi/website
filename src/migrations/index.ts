import * as migration_20260528_130143 from './20260528_130143';
import * as migration_20260528_162531 from './20260528_162531';
import * as migration_20260611_120000 from './20260611_120000';

export const migrations = [
  {
    up: migration_20260528_130143.up,
    down: migration_20260528_130143.down,
    name: '20260528_130143',
  },
  {
    up: migration_20260528_162531.up,
    down: migration_20260528_162531.down,
    name: '20260528_162531'
  },
  {
    up: migration_20260611_120000.up,
    down: migration_20260611_120000.down,
    name: '20260611_120000'
  },
];
