import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddSocialMediaUrlsToProfile1740650000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add facebook_url column
    await queryRunner.addColumn(
      "profile",
      new TableColumn({
        name: "facebook_url",
        type: "varchar",
        length: "500",
        isNullable: true,
      })
    );

    // Add tiktok_url column
    await queryRunner.addColumn(
      "profile",
      new TableColumn({
        name: "tiktok_url",
        type: "varchar",
        length: "500",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("profile", "tiktok_url");
    await queryRunner.dropColumn("profile", "facebook_url");
  }
}
