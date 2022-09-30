/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('provider_clinics', {
        id: 'id',
        provider_id: { type: 'uuid', notNull: true, references: 'service_providers(provider_id)' },
        center_id: { type: 'uuid', references: 'service_centers(center_id)' },
        status: { type: 'Boolean', default: true },
        created_at: {
            type: 'timestamp',
            default: pgm.func('current_timestamp'),
        },
        created_by: {
            type: 'uuid',
            references: 'service_providers(provider_id)',
            onDelete: 'CASCADE'
        },
        updated_at: {
            type: 'timestamp',
            default: pgm.func('current_timestamp'),
        },
        updated_by: {
            type: 'uuid',
            references: 'service_providers(provider_id)',
            onDelete: 'CASCADE'
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
