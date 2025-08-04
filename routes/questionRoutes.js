const express = require("express")
const router = express.Router()
const { Category, Question } = require("../models")

const categoryMap = {
  arithmetic: "Arithmetic Aptitude",
  di: "Data Interpretation",
  verbal: "Verbal Ability",
  logical: "Logical Reasoning",
  reasoning: "Verbal Reasoning",
  puzzle: "Puzzle Quizes",
}

// Handle category routes from sidebar
router.get("/category/:slug", async (req, res) => {
  const slug = req.params.slug
  const categoryName = categoryMap[slug]

  if (!categoryName) {
    return res.status(404).send(`
      <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
        <h1 style="color: #e74c3c;">Category Not Found</h1>
        <p style="color: #7f8c8d;">The category "${slug}" doesn't exist.</p>
        <a href="/login" style="display: inline-block; background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px;">Go to Login</a>
      </div>
    `)
  }

  try {
    const isLoggedIn = !!req.session.user

    // Try to get questions from database first
    let questions = []
    try {
      const category = await Category.findOne({
        where: { slug },
        include: [Question],
      })

      if (category && category.Questions && category.Questions.length > 0) {
        questions = category.Questions.map((q) => ({
          id: q.id,
          question: q.question,
          options: typeof q.options === "string" ? JSON.parse(q.options) : q.options,
          correctAnswer: q.correctAnswer,
        }))
      }
    } catch (dbError) {
      // Use prebuilt questions if database error
    }

    // Render the category page with questions
    res.render("categoryQuestion", {
      layout: "layout",
      title: `${categoryName} - AptitudePro+`,
      categoryTitle: categoryName,
      selectedCategory: categoryName,
      questions,
      isLoggedIn,
      user: req.session.user || null,
    })
  } catch (error) {
    // Simple error response without trying to render error view
    res.status(500).send(`
      <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
        <h1 style="color: #e74c3c;">Error Loading Category</h1>
        <p style="color: #7f8c8d;">There was an error loading the ${categoryName} questions.</p>
        <a href="/login" style="display: inline-block; background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px;">Go to Login</a>
      </div>
    `)
  }
})

module.exports = router
