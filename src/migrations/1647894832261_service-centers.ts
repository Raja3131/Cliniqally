/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('service_centers', {
        id: 'id',
        center_id: { type: 'uuid', notNull: true, unique: true },
        name: { type: 'varchar(255)', notNull: true },
        type: { type: 'varchar(255)', notNull: true }, // Clinic, MedicalStore, Lab
        email: { type: 'varchar(255)', notNull: true, unique: true },
        profile_picture: { type: 'varchar(255)' },
        country_code: { type: 'varchar(10)' },
        phone_number: { type: 'varchar(30)' },
        status: { type: 'varchar(255)', notNull: true, default: 'Pending' }, // enum - Pending, Approved, Suspended
        got_assistance: { type: 'Boolean', default: false },
        representative_code: { type: 'varchar(255)' },
        deleted: { type: 'Boolean', default: false },
        timezone: { type: 'varchar(255)' },
        country: {
            type: 'uuid',
            references: 'countries(country_id)'
        },
        geolocation: {
            type: "point"
        }
    })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    //
}
