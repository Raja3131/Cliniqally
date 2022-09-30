/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('patients', {
        id: 'id',
        consumer_id: {
            type: 'uuid',
            notNull: true,
            references: 'service_consumers(consumer_id)',
            onDelete: 'CASCADE'
        },
        patient_id: { type: 'varchar(255)', notNull: true, unique: true }, // minimum three characters like ABC1
        gender: { type: 'varchar(255)' },
        dob: { type: 'varchar(255)' },
        emergency_contact: { type: 'bigint' },
        height: { type: 'real' }, //in cm
        weight: { type: 'real' }, // in kg
        blood_group: {
            type: 'uuid',
            references: 'blood_groups(group_id)'
        },
        occupation: {
            type: 'uuid',
            references: 'occupations(occupation_id)'
        },
        address: { type: 'text' },
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
        deleted: { type: 'Boolean', default: false },
    })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    //
}
