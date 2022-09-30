/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('service_providers_agreement', {
        id: 'id',
        agreement_id: { type: 'uuid', notNull: true, unique: true },
        created_at: {
            type: 'timestamp',
            default: pgm.func('current_timestamp'),
        },
        agreement_status: { type: 'Boolean', default: false },
    })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    // 
}
