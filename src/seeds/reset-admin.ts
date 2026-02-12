import "reflect-metadata";
import { AppDataSource } from "@config/database";
import { Profile, UserRole } from "@entities/Profile";

async function resetAdmin() {
  try {
    console.log("🔄 Connecting to database...");
    await AppDataSource.initialize();
    console.log("✅ Database connected");

    const profileRepo = AppDataSource.getRepository(Profile);

    // Delete existing admin
    console.log("🔄 Deleting existing admin user...");
    await profileRepo.delete({ username: "admin" });
    console.log("✅ Admin user deleted");

    // Create new admin
    console.log("🔄 Creating new admin user...");
    // ⚠️ Don't hash here - @BeforeInsert hook will auto-hash

    const admin = profileRepo.create({
      username: "admin",
      password: "Admin@123", // Plain text - will be hashed by @BeforeInsert
      role: UserRole.ADMIN,
      is_active: true,
      company_name: "Điện Tử Nam Tông",
      email: "admin@dientunantong.com",
      phone: "0123456789",
      address: "Việt Nam",
    });

    await profileRepo.save(admin);

    console.log(`
╔════════════════════════════════════════════════╗
║                                                ║
║   ✅ Admin User Reset Successfully!           ║
║                                                ║
║   👤 Username: admin                          ║
║   🔒 Password: Admin@123                      ║
║   📧 Email: admin@dientunantong.com           ║
║   🏢 Company: Điện Tử Nam Tông                ║
║                                                ║
║   ⚠️  IMPORTANT: Please change password        ║
║      after first login!                        ║
║                                                ║
╚════════════════════════════════════════════════╝
    `);

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error resetting admin:", error);
    process.exit(1);
  }
}

resetAdmin();


