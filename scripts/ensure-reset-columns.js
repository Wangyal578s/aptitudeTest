const { sequelize, User, Admin } = require("../models")

const ensureResetColumns = async () => {
  try {
    console.log("🔄 Ensuring reset token columns exist...")

    // Check and add columns for Users table
    try {
      await sequelize.query(`
        ALTER TABLE "Users" 
        ADD COLUMN IF NOT EXISTS "resetToken" VARCHAR(255),
        ADD COLUMN IF NOT EXISTS "resetTokenExpiry" TIMESTAMP WITH TIME ZONE;
      `)
      console.log("✅ Users table reset columns ensured")
    } catch (error) {
      console.log("ℹ️ Users table columns already exist or error:", error.message)
    }

    // Check and add columns for Admins table
    try {
      await sequelize.query(`
        ALTER TABLE "Admins" 
        ADD COLUMN IF NOT EXISTS "resetToken" VARCHAR(255),
        ADD COLUMN IF NOT EXISTS "resetTokenExpiry" TIMESTAMP WITH TIME ZONE;
      `)
      console.log("✅ Admins table reset columns ensured")
    } catch (error) {
      console.log("ℹ️ Admins table columns already exist or error:", error.message)
    }

    console.log("🎉 Database schema check completed!")
  } catch (error) {
    console.error("❌ Schema check failed:", error)
  } finally {
    await sequelize.close()
  }
}

ensureResetColumns()
