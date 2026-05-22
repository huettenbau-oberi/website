import * as migration_20260517_200133 from './20260517_200133';
import * as migration_20260518_180631 from './20260518_180631';
import * as migration_20260518_181254 from './20260518_181254';
import * as migration_20260518_182549 from './20260518_182549';
import * as migration_20260519_220319 from './20260519_220319';
import * as migration_20260520_013500 from './20260520_013500';
import * as migration_20260520_145105 from './20260520_145105';
import * as migration_20260520_203533 from './20260520_203533';
import * as migration_20260521_210621 from './20260521_210621';
import * as migration_20260521_234030 from './20260521_234030';
import * as migration_20260522_004720 from './20260522_004720';
import * as migration_20260522_132642 from './20260522_132642';

export const migrations = [
  {
    up: migration_20260517_200133.up,
    down: migration_20260517_200133.down,
    name: '20260517_200133',
  },
  {
    up: migration_20260518_180631.up,
    down: migration_20260518_180631.down,
    name: '20260518_180631',
  },
  {
    up: migration_20260518_181254.up,
    down: migration_20260518_181254.down,
    name: '20260518_181254',
  },
  {
    up: migration_20260518_182549.up,
    down: migration_20260518_182549.down,
    name: '20260518_182549',
  },
  {
    up: migration_20260519_220319.up,
    down: migration_20260519_220319.down,
    name: '20260519_220319',
  },
  {
    up: migration_20260520_013500.up,
    down: migration_20260520_013500.down,
    name: '20260520_013500',
  },
  {
    up: migration_20260520_145105.up,
    down: migration_20260520_145105.down,
    name: '20260520_145105',
  },
  {
    up: migration_20260520_203533.up,
    down: migration_20260520_203533.down,
    name: '20260520_203533',
  },
  {
    up: migration_20260521_210621.up,
    down: migration_20260521_210621.down,
    name: '20260521_210621',
  },
  {
    up: migration_20260521_234030.up,
    down: migration_20260521_234030.down,
    name: '20260521_234030',
  },
  {
    up: migration_20260522_004720.up,
    down: migration_20260522_004720.down,
    name: '20260522_004720',
  },
  {
    up: migration_20260522_132642.up,
    down: migration_20260522_132642.down,
    name: '20260522_132642'
  },
];
