/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('queries', {
        id: 'id',
        query_id: { type: 'uuid', notNull: true, unique: true },
        type_id: {
            type: 'uuid',
            references: 'type_queries(type_id)',
            onDelete: 'CASCADE'
        },
        reason_id: {
            type: 'uuid',
            references: 'reason_queries(reason_id)',
            onDelete: 'CASCADE'
        },
        query: { type: 'varchar(255)', notNull: true },
        query_description: { type: 'varchar(255)', notNull: true },
        query_attachment: { type: 'varchar(255)', notNull: true },
        status: { type: 'varchar(255)', notNull: true, default: 'active' },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
        created_by: {
            type: 'uuid',
            notNull: true,
            references: 'service_providers(provider_id)',
            onDelete: 'CASCADE'
        },
        updated_at: {
            type: 'timestamp',
            default: pgm.func('current_timestamp'),
        },
        deleted_at: {
            type: 'timestamp'
        },
        deleted_by: {
            type: 'uuid',
            references: 'service_providers(provider_id)',
            onDelete: 'CASCADE'
        }
    })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    // 
}