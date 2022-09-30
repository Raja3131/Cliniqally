/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('invitations', {
        id: 'id',
        invitation_token: { type: 'text', notNull: true },
        email: { type: 'varchar(255)', notNull: true },
        clinic_id: {
            type: 'uuid',
            references: 'clinics(clinic_id)',
            onDelete: 'CASCADE'
        },
        user_type: { type: 'varchar(255)', notNull: true },
        registeredAt: {
            type: 'timestamp',
            default: pgm.func('current_timestamp'),
        },
        status: { type: 'varchar(255)', notNull: true, default: 'enabled' },
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
