/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('states', {
        id: 'id',
        state_id: { type: 'uuid', notNull: true, unique: true },
        name: { type: 'varchar(255)', notNull: true },
        country: {
            type: 'uuid',
            notNull: true,
            references: 'countries(country_id)'
        },
        status: { type: 'varchar(255)', notNull: true, default: 'enabled' },
        created_at: {
            type: 'timestamp',
            notNull: true,
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
        },
        deleted_at: {
            type: 'timestamp'
        },
        deleted_by: {
            type: 'uuid',
            references: 'admins(admin_id)',
            onDelete: 'CASCADE'
        }
    })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    //
}
