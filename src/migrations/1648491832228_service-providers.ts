/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('service_providers', {
        id: 'id',
        provider_id: { type: 'uuid', notNull: true, unique: true },
        user_type: { type: 'varchar(255)', notNull: true }, // doctor, lab_technician
        profile_picture: { type: 'varchar(255)' },
        email: { type: 'varchar(255)', unique: true },
        password: { type: 'varchar(255)', },
        first_name: { type: 'varchar(255)' },
        last_name: { type: 'varchar(255)' },
        dob: { type: 'varchar(255)' },
        gender: { type: 'varchar(255)' },
        country: {
            type: 'uuid',
            references: 'countries(country_id)'
        },
        state: {
            type: 'uuid',
            references: 'states(state_id)'
        },
        city: {
            type: 'uuid',
            references: 'cities(city_id)'
        },

        country_code: { type: 'varchar(10)' },
        mobile: { type: 'varchar(64)', unique: true },
        otp: { type: 'integer' },
        expiration_time: { type: 'timestamp' },
        otp_verified: { type: 'Boolean', default: false },
        status: { type: 'varchar(255)', notNull: true, default: 'enabled' }, // enum - enabled, disabled, suspended
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
        deleted: { type: 'Boolean', default: false },
        default_clinic: {
            type: 'uuid',
            references: 'service_centers(center_id)',
        },
        referred_by: { type: 'varchar(255)' },
        timezone: { type: 'varchar(255)' }
    })
}
export async function down(pgm: MigrationBuilder): Promise<void> {
    // 
}
