const { sequelize } = require("../models")

const addResetTokenColumns = async () => {
  try {
    console.log("🔄 Adding reset token columns to database...")

    // Add resetToken and resetTokenExpiry columns to Users table
    await sequelize.query(`
      ALTER TABLE "Users" 
      ADD COLUMN IF NOT EXISTS "resetToken" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "resetTokenExpiry" TIMESTAMP WITH TIME ZONE;
    `)

    // Add resetToken and resetTokenExpiry columns to Admins table
    await sequelize.query(`
      ALTER TABLE "Admins" 
      ADD COLUMN IF NOT EXISTS "resetToken" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "resetTokenExpiry" TIMESTAMP WITH TIME ZONE;
    `)

    console.log("✅ Reset token columns added successfully!")
    console.log("🎉 Database migration completed!")
  } catch (error) {
    console.error("❌ Migration failed:", error)
  } finally {
    await sequelize.close()
  }
}

addResetTokenColumns()
