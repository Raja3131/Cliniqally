/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("patient_vital_signs", {
    patient_id: {
      type: "varchar(255)",
      notNull: false,
    },
    bp: { type: "varchar(255)", notNull: true },
    weight: { type: "varchar(255)", notNull: true },
    height: { type: "varchar(255)", notNull: true },
    temperature: { type: "varchar(255)", notNull: true },
    pulse: { type: "varchar(255)", notNull: true },
    respiratory_rate: { type: "varchar(255)", notNull: true },
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  //
}
