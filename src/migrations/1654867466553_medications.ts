/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('medications', {
        id: 'id',
        consumer_id: {
            type: 'uuid',
            notNull: true,
            references: 'service_consumers(consumer_id)',
            onDelete: 'CASCADE'
        },
        medication_id: { type: 'uuid', notNull: true, unique: true },
        description: { type: 'text', notNull: true },
        status: { type: 'Boolean', default: true },
        created_at: {
            type: 'timestamp',
            default: pgm.func('current_timestamp'),
        },
        created_by: {
            type: 'uuid',
            references: 'service_consumers(consumer_id)',
            onDelete: 'CASCADE'
        },
        updated_at: {
            type: 'timestamp',
            default: pgm.func('current_timestamp'),
        },
        updated_by: {
            type: 'uuid',
            references: 'service_consumers(consumer_id)',
            onDelete: 'CASCADE'
        },
    })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    // 
}
