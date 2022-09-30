/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('prescriptions', {
        id: 'id',
        prescription_id: { type: 'uuid', notNull: true, unique: true },
        consumer_id: {
            type: 'uuid',
            references: 'service_consumers(consumer_id)',
            onDelete: 'CASCADE'
        },
        provider_id: {
            type: 'uuid',
            references: 'service_providers(provider_id)',
            onDelete: 'CASCADE'
        },
        center_id: {
            type: 'uuid',
            references: 'service_centers(center_id)',
            onDelete: 'CASCADE'
        },
        appointment_id: {
            type: 'uuid',
            references: '',
            onDelete: 'CASCADE'
        },
        medicine_id: {
            type: 'uuid',
            references: '',
            onDelete: 'CASCADE'
        },
        medicine: { type: 'varchar(255)', notNull: true },
        description: { type: 'varchar(255)', notNull: true },
        deleted: { type: 'Boolean', default: false },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        }
    })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    // 
}
