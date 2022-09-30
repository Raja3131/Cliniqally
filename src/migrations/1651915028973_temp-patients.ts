/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('temp_patients', {
        id: 'id',
        temp_patientid: { type: 'uuid', notNull: true, unique: true },
        first_name: { type: 'varchar(255)', notNull: true },
        last_name: { type: 'varchar(255)', notNull: true },
        country_code: { type: 'varchar(10)' },
        mobile: { type: 'varchar(64)' },
        otp: { type: 'integer' },
        expiration_time: { type: 'timestamp' },
        otp_verified: { type: 'Boolean', default: false },
    })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    // 
}
