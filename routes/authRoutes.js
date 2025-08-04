const express = require("express")
const router = express.Router()

const { signup } = require("../controllers/authController")
const { verifyEmail } = require("../controllers/verifyController")
const { login } = require("../controllers/loginController")
const { forgotPassword, resetPassword } = require("../controllers/forgotPasswordController")

// Redirect root to login
router.get("/", (req, res) => res.redirect("/login"))

// Signup page
router.get("/signup", (req, res) => {
  res.render("signup", {
    layout: false,
    success: req.session.success,
    error: req.session.error,
  })
  req.session.success = null
  req.session.error = null
})

// Signup handler
router.post("/signup", signup)

// Email verification (user + admin)
router.get("/verify", verifyEmail)
router.get("/admin/verify", verifyEmail)

// Login page
router.get("/login", (req, res) => {
  res.render("login", {
    layout: false,
    success: req.session.success,
    error: req.session.error,
  })
  req.session.success = null
  req.session.error = null
})

// Login handler
router.post("/login", login)

// Forgot password page
router.get("/forgot-password", (req, res) => {
  res.render("forgot-password", {
    layout: false,
    success: req.session.success,
    error: req.session.error,
  })
  req.session.success = null
  req.session.error = null
})

// Forgot password handler
router.post("/forgot-password", forgotPassword)

// Reset password page
router.get("/reset-password", (req, res) => {
  const token = req.query.token

  if (!token) {
    req.session.error = "Invalid reset link."
    return res.redirect("/forgot-password")
  }

  res.render("reset-password", {
    layout: false,
    token,
    success: req.session.success,
    error: req.session.error,
  })
  req.session.success = null
  req.session.error = null
})

// Reset password handler
router.post("/reset-password", resetPassword)

// Welcome page after login
router.get("/welcome", (req, res) => {
  if (!req.session.user) return res.redirect("/login")

  if (req.session.user.type === "admin") {
    return res.redirect("/admin/dashboard")
  }

  res.redirect("/categories")
})

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err)
      return res.status(500).send("Could not log out.")
    }
    res.redirect("/login")
  })
})

module.exports = router
