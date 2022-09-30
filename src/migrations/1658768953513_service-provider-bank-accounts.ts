/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('service_provider_bank_accounts', {
        id: 'id',
        bankaccount_id: { type: 'uuid', notNull: true, unique: true },
        provider_id: { type: 'uuid', notNull: true, references: 'service_providers(provider_id)' },
        center_id: { type: 'uuid', references: 'service_centers(center_id)' },
        account_holder_name: { type: 'varchar(255)' },
        account_number: { type: 'varchar(255)' },
        bank_branch: { type: 'varchar(255)' },
        ifsc_code: { type: 'varchar(255)' },
        created_at: {
            type: 'timestamp',
            default: pgm.func('current_timestamp'),
        }
    })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    //
}
