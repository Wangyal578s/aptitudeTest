const { sequelize } = require("../models")

const fixDatabaseSchema = async () => {
  try {
    console.log("🔄 Fixing database schema...")

    // Drop all tables and recreate them with correct structure
    await sequelize.query('DROP TABLE IF EXISTS "Questions" CASCADE')
    await sequelize.query('DROP TABLE IF EXISTS "Categories" CASCADE')
    await sequelize.query('DROP TABLE IF EXISTS "Users" CASCADE')
    await sequelize.query('DROP TABLE IF EXISTS "Admins" CASCADE')
    await sequelize.query('DROP TABLE IF EXISTS "QuizResults" CASCADE')

    console.log("✅ Dropped existing tables")

    // Force sync all models to recreate tables with correct structure
    await sequelize.sync({ force: true })

    console.log("✅ Recreated all tables with correct structure")

    // Seed categories
    const { Category } = require("../models")
    const categories = [
      { name: "Arithmetic Aptitude", slug: "arithmetic" },
      { name: "Data Interpretation", slug: "di" },
      { name: "Verbal Ability", slug: "verbal" },
      { name: "Logical Reasoning", slug: "logical" },
      { name: "Verbal Reasoning", slug: "reasoning" },
      { name: "Puzzle Quizes", slug: "puzzle" },
    ]

    for (const category of categories) {
      await Category.create(category)
    }

    console.log("✅ Seeded categories")
    console.log("🎉 Database schema fixed successfully!")
    console.log("📝 You can now add questions through the admin panel.")
  } catch (error) {
    console.error("❌ Schema fix failed:", error)
  } finally {
    await sequelize.close()
  }
}

fixDatabaseSchema()
