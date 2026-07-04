import * as migration_20260528_130143 from './20260528_130143';
import * as migration_20260528_162531 from './20260528_162531';
import * as migration_20260611_120000 from './20260611_120000';
import * as migration_20260629_190216_add_system_admin_audit from './20260629_190216_add_system_admin_audit';
import * as migration_20260629_220000_add_user_roles from './20260629_220000_add_user_roles';
import * as migration_20260704_140842 from './20260704_140842';

export const migrations = [
  {
    up: migration_20260528_130143.up,
    down: migration_20260528_130143.down,
    name: '20260528_130143',
  },
  {
    up: migration_20260528_162531.up,
    down: migration_20260528_162531.down,
    name: '20260528_162531',
  },
  {
    up: migration_20260611_120000.up,
    down: migration_20260611_120000.down,
    name: '20260611_120000',
  },
  {
    up: migration_20260629_190216_add_system_admin_audit.up,
    down: migration_20260629_190216_add_system_admin_audit.down,
    name: '20260629_190216_add_system_admin_audit',
  },
  {
    up: migration_20260629_220000_add_user_roles.up,
    down: migration_20260629_220000_add_user_roles.down,
    name: '20260629_220000_add_user_roles',
  },
  {
    up: migration_20260704_140842.up,
    down: migration_20260704_140842.down,
    name: '20260704_140842'
  },
];
