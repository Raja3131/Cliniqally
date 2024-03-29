/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('consumer_allergies', {
        consumer_id: {
            type: 'uuid',
            notNull: true,
            references: 'service_consumers(consumer_id)',
            onDelete: 'CASCADE'
        },
        allergic_id: { type: 'uuid', notNull: true},
    })
}


export async function down(pgm: MigrationBuilder): Promise<void> {
    // 
}
