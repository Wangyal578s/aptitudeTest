const { Category, Question } = require("../models")

const showDashboard = async (req, res) => {
  try {
    const totalQuestions = await Question.count()
    const totalCategories = await Category.count()

    res.render("admin/dashboard", {
      title: "Admin Dashboard",
      totalQuestions,
      totalCategories,
      user: req.session.user,
    })
  } catch (err) {
    console.error("Dashboard error:", err)
    res.status(500).send("Error loading dashboard")
  }
}

const showAddQuestionForm = async (req, res) => {
  try {
    const categories = await Category.findAll()
    res.render("admin/add-question", {
      title: "Add Question",
      categories,
      user: req.session.user,
      success: req.session.success,
      error: req.session.error,
    })
    req.session.success = null
    req.session.error = null
  } catch (err) {
    console.error("Error loading form:", err)
    res.status(500).send("Error loading form.")
  }
}

const addQuestion = async (req, res) => {
  const { categoryId, question, optionA, optionB, optionC, optionD, correctAnswer } = req.body

  if (!categoryId || !question || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
    req.session.error = "All fields are required."
    return res.redirect("/admin/add-question")
  }

  try {
    const options = {
      A: optionA,
      B: optionB,
      C: optionC,
      D: optionD,
    }

    await Question.create({
      categoryId: Number.parseInt(categoryId), // Ensure it's an integer
      question,
      options, // Store as JSON object
      correctAnswer,
      isPublic: true,
    })

    req.session.success = "Question added successfully!"
    res.redirect("/admin/add-question")
  } catch (err) {
    console.error("Error saving question:", err)
    req.session.error = "Failed to save question."
    res.redirect("/admin/add-question")
  }
}

const listQuestions = async (req, res) => {
  try {
    const questions = await Question.findAll({
      include: [{ model: Category }],
      order: [["createdAt", "DESC"]],
    })

    res.render("admin/question-list", {
      title: "Manage Questions",
      questions,
      user: req.session.user,
      success: req.session.success,
      error: req.session.error,
    })
    req.session.success = null
    req.session.error = null
  } catch (err) {
    console.error("Failed to list questions:", err)
    res.status(500).send("Could not load questions.")
  }
}

const showEditForm = async (req, res) => {
  const { id } = req.params

  try {
    const question = await Question.findByPk(id)
    const categories = await Category.findAll()

    if (!question) {
      req.session.error = "Question not found."
      return res.redirect("/admin/questions")
    }

    // Parse options - handle both JSON and string formats
    let parsedOptions = {}
    try {
      if (typeof question.options === "string") {
        parsedOptions = JSON.parse(question.options)
      } else if (typeof question.options === "object") {
        parsedOptions = question.options
      } else {
        parsedOptions = { A: "", B: "", C: "", D: "" }
      }
    } catch (e) {
      console.error("Error parsing options:", e)
      parsedOptions = { A: "", B: "", C: "", D: "" }
    }

    res.render("admin/edit-question", {
      title: "Edit Question",
      question: {
        ...question.toJSON(),
        parsedOptions,
      },
      categories,
      user: req.session.user,
    })
  } catch (err) {
    console.error("Edit form error:", err)
    res.status(500).send("Error loading edit form")
  }
}

const updateQuestion = async (req, res) => {
  const { id } = req.params
  const { categoryId, question, optionA, optionB, optionC, optionD, correctAnswer } = req.body

  try {
    const options = {
      A: optionA,
      B: optionB,
      C: optionC,
      D: optionD,
    }

    await Question.update(
      {
        categoryId: Number.parseInt(categoryId),
        question,
        options, // Store as JSON object
        correctAnswer,
      },
      {
        where: { id },
      },
    )

    req.session.success = "Question updated successfully!"
    res.redirect("/admin/questions")
  } catch (err) {
    console.error("Error updating question:", err)
    req.session.error = "Failed to update question."
    res.redirect("/admin/questions")
  }
}

const deleteQuestion = async (req, res) => {
  const { id } = req.params
  try {
    await Question.destroy({ where: { id } })
    req.session.success = "Question deleted successfully!"
    res.redirect("/admin/questions")
  } catch (err) {
    console.error("Error deleting question:", err)
    req.session.error = "Failed to delete question."
    res.redirect("/admin/questions")
  }
}

module.exports = {
  showDashboard,
  showAddQuestionForm,
  addQuestion,
  listQuestions,
  showEditForm,
  updateQuestion,
  deleteQuestion,
}
