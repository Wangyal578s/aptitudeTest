const express = require("express")
const router = express.Router()
const { Category, Question, QuizResult } = require("../models")
const { requireLogin } = require("../middleware/auth")

// Categories page (replaces the old sidebar navigation) - NO LAYOUT
router.get("/categories", requireLogin, async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [
        {
          model: Question,
          attributes: ["id"],
        },
      ],
    })

    // Add question count to each category
    const categoriesWithCount = categories.map((category) => ({
      ...category.toJSON(),
      questionCount: category.Questions ? category.Questions.length : 0,
    }))

    res.render("categories", {
      layout: false, // No layout for user pages
      title: "Choose Category",
      categories: categoriesWithCount,
      user: req.session.user,
    })
  } catch (error) {
    console.error("Error loading categories:", error)
    res.status(500).send("Error loading categories")
  }
})

// Quiz page for specific category - NO LAYOUT
router.get("/quiz/:slug", requireLogin, async (req, res) => {
  try {
    const category = await Category.findOne({
      where: { slug: req.params.slug },
      include: [Question],
    })

    if (!category) {
      return res.status(404).send("Category not found")
    }

    res.render("quiz", {
      layout: false, // No layout for user pages
      title: `${category.name} Quiz`,
      category,
      questions: category.Questions,
      user: req.session.user,
    })
  } catch (error) {
    console.error("Error loading quiz:", error)
    res.status(500).send("Error loading quiz")
  }
})

// Submit quiz - NO LAYOUT
router.post("/quiz/:slug/submit", requireLogin, async (req, res) => {
  try {
    const category = await Category.findOne({
      where: { slug: req.params.slug },
      include: [Question],
    })

    if (!category) {
      return res.status(404).send("Category not found")
    }

    const questions = category.Questions
    let score = 0
    const results = []

    // Calculate score and prepare results
    questions.forEach((question) => {
      const userAnswer = req.body[`question_${question.id}`]
      const isCorrect = userAnswer === question.correctAnswer

      if (isCorrect) score++

      results.push({
        questionText: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
      })
    })

    // Save result to database
    await QuizResult.create({
      userEmail: req.session.user.email,
      categoryId: category.id,
      score,
      total: questions.length,
    })

    const percentage = (score / questions.length) * 100

    res.render("quiz-result", {
      layout: false, // No layout for user pages
      title: "Quiz Results",
      categoryName: category.name,
      score,
      total: questions.length,
      percentage,
      results,
      user: req.session.user,
    })
  } catch (error) {
    console.error("Error submitting quiz:", error)
    res.status(500).send("Error submitting quiz")
  }
})

// User history - NO LAYOUT
router.get("/user/history", requireLogin, async (req, res) => {
  try {
    const history = await QuizResult.findAll({
      where: { userEmail: req.session.user.email },
      include: [Category],
      order: [["createdAt", "DESC"]],
    })

    // Calculate statistics
    let totalScore = 0
    let bestScore = 0

    history.forEach((result) => {
      const percentage = (result.score / result.total) * 100
      totalScore += percentage
      if (percentage > bestScore) bestScore = percentage
    })

    const averageScore = history.length > 0 ? totalScore / history.length : 0

    res.render("user-history", {
      layout: false, // No layout for user pages
      title: "My History",
      history,
      averageScore,
      bestScore,
      user: req.session.user,
    })
  } catch (error) {
    console.error("Error loading history:", error)
    res.status(500).send("Error loading history")
  }
})

module.exports = router
