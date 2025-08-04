const express = require("express")
const router = express.Router()
const { requireAdmin } = require("../middleware/auth")
const adminController = require("../controllers/adminController")

// Admin dashboard
router.get("/admin/dashboard", requireAdmin, adminController.showDashboard)

// Question management routes
router.get("/admin/add-question", requireAdmin, adminController.showAddQuestionForm)
router.post("/admin/add-question", requireAdmin, adminController.addQuestion)
router.get("/admin/questions", requireAdmin, adminController.listQuestions)
router.get("/admin/questions/:id/edit", requireAdmin, adminController.showEditForm)
router.post("/admin/questions/:id/edit", requireAdmin, adminController.updateQuestion)
router.post("/admin/questions/:id/delete", requireAdmin, adminController.deleteQuestion)

module.exports = router
