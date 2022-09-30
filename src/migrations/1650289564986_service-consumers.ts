/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('service_consumers', {
        id: 'id',
        consumer_id: { type: 'uuid', notNull: true, unique: true },
        user_type: { type: 'varchar(255)' }, // patient,...
        first_name: { type: 'varchar(255)', notNull: true },
        last_name: { type: 'varchar(255)', notNull: true },
        profile_picture: { type: 'varchar(255)' },
        email: { type: 'varchar(255)', unique: true },
        password: { type: 'varchar(255)' },
        country_code: { type: 'varchar(10)' },
        mobile: { type: 'varchar(64)', unique: true },
        otp: { type: 'integer' },
        expiration_time: { type: 'timestamp' },
        otp_verified: { type: 'Boolean', default: false },
        verified: { type: 'Boolean', default: false },
        status: { type: 'varchar(255)', default: 'enabled' }, // enum - enabled, disabled, suspended
        created_at: {
            type: 'timestamp',
            default: pgm.func('current_timestamp'),
        },
        deleted: { type: 'Boolean', default: false },
        timezone: { type: 'varchar(255)' }
    })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    //
}
