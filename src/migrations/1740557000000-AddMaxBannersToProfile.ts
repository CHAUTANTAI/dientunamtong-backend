import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddMaxBannersToProfile1740557000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "profile",
      new TableColumn({
        name: "max_banners",
        type: "int",
        default: 6,
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("profile", "max_banners");
  }
}
