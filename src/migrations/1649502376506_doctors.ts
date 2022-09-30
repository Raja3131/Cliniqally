/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('doctors', {
        id: 'id',
        provider_id: {
            type: 'uuid',
            notNull: true,
            references: 'service_providers(provider_id)',
            onDelete: 'CASCADE'
        },
        profile_picture: { type: 'varchar(255)' },
        medical_council_reg_no: { type: 'varchar(255)' },
        medical_council_reg_name: { type: 'varchar(255)' },
        license_number: { type: 'varchar(255)' },
        address: { type: 'text' },
        pincode: { type: 'integer' },
        referred_by: { type: 'varchar(255)' },
        awards: { type: 'text' },
        about: { type: 'text' },
        membership: { type: 'text' },
        specialization: {
            type: "text"
        },
        deleted: { type: 'Boolean', default: false },
        mobile_number: { type: 'varchar(64)' },
        verified: { type: 'Boolean', default: false },
    })
}
export async function down(pgm: MigrationBuilder): Promise<void> {
    //
}
