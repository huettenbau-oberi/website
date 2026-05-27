import * as migration_20260523_025304 from './20260523_025304';
import * as migration_20260526_223328 from './20260526_223328';
import * as migration_20260526_230338 from './20260526_230338';
import * as migration_20260527_110931 from './20260527_110931';

export const migrations = [
  {
    up: migration_20260523_025304.up,
    down: migration_20260523_025304.down,
    name: '20260523_025304',
  },
  {
    up: migration_20260526_223328.up,
    down: migration_20260526_223328.down,
    name: '20260526_223328',
  },
  {
    up: migration_20260526_230338.up,
    down: migration_20260526_230338.down,
    name: '20260526_230338',
  },
  {
    up: migration_20260527_110931.up,
    down: migration_20260527_110931.down,
    name: '20260527_110931'
  },
];
