const { Category } = require("../models")

const seedCategories = async () => {
  try {
    const categories = [
      { name: "Arithmetic Aptitude", slug: "arithmetic" },
      { name: "Data Interpretation", slug: "di" },
      { name: "Verbal Ability", slug: "verbal" },
      { name: "Logical Reasoning", slug: "logical" },
      { name: "Verbal Reasoning", slug: "reasoning" },
      { name: "Puzzle Quizes", slug: "puzzle" },
    ]

    for (const category of categories) {
      await Category.findOrCreate({
        where: { slug: category.slug },
        defaults: category,
      })
    }

    console.log("✅ Categories seeded successfully!")
  } catch (error) {
    console.error("❌ Error seeding categories:", error)
  }
}

seedCategories()
