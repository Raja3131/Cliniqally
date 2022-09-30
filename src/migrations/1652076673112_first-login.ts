/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    // First table for storing data in temporary and later moved to respected tables.. 
    pgm.createTable('first_login', {
        id: 'id',
        name: { type: 'varchar(255)', notNull: true },
        country_code: { type: 'varchar(10)' ,notNull: true},
        mobile: { type: 'varchar(64)', unique: true ,notNull: true},
        otp: { type: 'integer' },
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
