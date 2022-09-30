/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('temp_service_providers', {
        id: 'id',
        temp_provider_id: { type: 'uuid', notNull: true, unique: true },
        first_name: { type: 'varchar(255)', notNull: true },
        last_name: { type: 'varchar(255)', notNull: true },
        country_code: { type: 'varchar(10)', notNull: true },
        mobile: { type: 'varchar(64)', notNull: true },
        otp: { type: 'integer' },
        expiration_time: { type: 'timestamp' },
        otp_verified: { type: 'Boolean', default: false },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
        deleted: { type: 'Boolean', default: false },
    })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    // 
}
