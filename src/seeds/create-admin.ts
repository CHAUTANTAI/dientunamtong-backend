import "reflect-metadata";
import bcrypt from "bcrypt";
import { AppDataSource } from "@config/database";
import { Profile, UserRole } from "@entities/Profile";

async function createAdmin() {
  try {
    console.log("🔄 Connecting to database...");
    await AppDataSource.initialize();
    console.log("✅ Database connected");

    const profileRepo = AppDataSource.getRepository(Profile);

    // Check if admin exists
    const existingAdmin = await profileRepo.findOne({
      where: { username: "admin" },
    });

    if (existingAdmin) {
      console.log("ℹ️  Admin user already exists");
      console.log("   Username: admin");
      process.exit(0);
    }

    // Create admin
    console.log("🔄 Creating admin user...");
    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    const admin = profileRepo.create({
      username: "admin",
      password: hashedPassword,
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
║   ✅ Admin User Created Successfully!         ║
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
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
}

createAdmin();

