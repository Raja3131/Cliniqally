/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('provider_sub_specializations', {
        provider_id: {
            type: 'uuid',
            references: 'service_providers(provider_id)',
            onDelete: 'CASCADE'
        },
        specialization_id: {
            type: 'uuid',
            references: 'specializations(specialization_id)',
            onDelete: 'CASCADE'
        },
        sub_specialization_id: {
            type: 'uuid',
            references: 'sub_specializations(sub_specialization_id)',
            onDelete: 'CASCADE'
        },
        experience: { type: 'integer' }
    })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    //
}
