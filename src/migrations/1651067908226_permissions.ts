/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('permissions', {
        id: 'id',
        permission_id: { type: 'uuid', notNull: true, unique: true },
        permission_slug: { type: 'varchar(64)', notNull: true, unique: true },
        module_id: {
            type: 'uuid',
            notNull: true,
            references: 'modules(module_id)',
            onDelete: 'CASCADE'
        },
        created_at: {
            type: 'timestamp',
            default: pgm.func('current_timestamp'),
        },
        created_by: {
            type: 'uuid',
            references: 'admins(admin_id)',
            onDelete: 'CASCADE'
        },
        updated_at: {
            type: 'timestamp',
            default: pgm.func('current_timestamp'),
        },
        updated_by: {
            type: 'uuid',
            references: 'admins(admin_id)',
            onDelete: 'CASCADE'
        }
    })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    //
}
