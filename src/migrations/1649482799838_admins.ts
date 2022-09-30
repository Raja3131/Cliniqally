
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('admins', {
        id: 'id',
        admin_id: { type: 'uuid', notNull: true, unique: true },
        name: { type: 'varchar(255)', notNull: true },
        email: { type: 'varchar(255)', notNull: true, unique: true },
        password: { type: 'varchar(255)', notNull: true },
        country_code: { type: 'varchar(10)' },
        mobile: { type: 'varchar(64)', unique: true },
        otp: { type: 'integer' },
        expiration_time: {
            type: 'timestamp',
        },
        otp_verified: { type: 'Boolean', default: false },
        user_type: { type: 'varchar(255)', notNull: true },
        status: { type: 'varchar(255)', notNull: true, default: 'enabled' },
        delegate_to: {
            type: 'uuid',
            references: 'service_providers(provider_id)',
        },
        created_at: {
            type: 'timestamp',
            default: pgm.func('current_timestamp'),
        },
        created_by: {
            type: 'uuid',
            references: 'admins(admin_id)',
            onDelete: 'CASCADE'
        },
        updated_at: {
            type: 'timestamp',
            default: pgm.func('current_timestamp'),
        },
        updated_by: {
            type: 'uuid',
            references: 'admins(admin_id)',
            onDelete: 'CASCADE'
        },
        deleted_at: {
            type: 'timestamp'
        },
        deleted_by: {
            type: 'uuid',
            references: 'admins(admin_id)',
            onDelete: 'CASCADE'
        }
    })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    exports.down = true
}
