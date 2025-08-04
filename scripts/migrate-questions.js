const { Question, sequelize } = require("../models")

const migrateQuestions = async () => {
  try {
    console.log("🔄 Starting question migration...")

    // First, let's see what we have
    const questions = await Question.findAll()
    console.log(`Found ${questions.length} existing questions`)

    // Drop and recreate the table with the correct structure
    await sequelize.query('DROP TABLE IF EXISTS "Questions" CASCADE')

    // Sync the model to create the table with the new structure
    await Question.sync({ force: true })

    console.log("✅ Questions table recreated with correct structure")
    console.log(
      "📝 Note: All existing questions have been removed. You can now add new questions through the admin panel.",
    )
  } catch (error) {
    console.error("❌ Migration failed:", error)
  } finally {
    await sequelize.close()
  }
}

migrateQuestions()
