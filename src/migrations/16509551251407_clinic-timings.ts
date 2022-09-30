/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('clinic_timings', {
        id: 'id',
        time_id: { type: 'uuid', notNull: true, unique: true },
        center_id: {
            type: 'uuid',
            notNull: true,
            references: 'service_centers(center_id)',
            onDelete: 'CASCADE'
        },
        clinic_id: {
            type: 'uuid',
            notNull: true,
            references: 'clinics(clinic_id)',
            onDelete: 'CASCADE'
        },
        day: { type: 'integer', notNull: true },
        opening_time: { type: 'varchar(255)' },
        closing_time: { type: 'varchar(255)' },
        previous_day_closing_is_today: { type: 'Boolean', default: false },
        closed: { type: 'Boolean', default: false },
        next_day_closing: { type: 'Boolean', default: false },
    })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    //
}
