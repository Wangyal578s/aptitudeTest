const express = require("express")
const path = require("path")
const session = require("express-session")
const dotenv = require("dotenv")
const { sequelize } = require("./models")
const expressLayouts = require("express-ejs-layouts")

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

// Middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(path.join(__dirname, "public")))

app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
)

// Global middleware to make user available in all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null
  res.locals.success = req.session.success || null
  res.locals.error = req.session.error || null

  // Clear flash messages after passing them to views
  delete req.session.success
  delete req.session.error

  next()
})

// View engine setup
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.use(expressLayouts)
app.set("layout", "layout")

// Import routes
const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")
const adminRoutes = require("./routes/adminRoutes")
const questionRoutes = require("./routes/questionRoutes")

// Use routes
app.use("/", authRoutes)
app.use("/", userRoutes)
app.use("/", adminRoutes)
app.use("/", questionRoutes)

// Simple 404 handler
app.use((req, res) => {
  res.status(404).send(`
    <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
      <h1 style="color: #e74c3c;">404 - Page Not Found</h1>
      <p style="color: #7f8c8d;">The page you're looking for doesn't exist.</p>
      <a href="/login" style="display: inline-block; background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px;">Go to Login</a>
    </div>
  `)
})

// Simple error handler
app.use((error, req, res, next) => {
  res.status(500).send(`
    <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
      <h1 style="color: #e74c3c;">Server Error</h1>
      <p style="color: #7f8c8d;">Something went wrong on our end.</p>
      <a href="/login" style="display: inline-block; background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px;">Go to Login</a>
    </div>
  `)
})

// Start server
sequelize
  .sync()
  .then(() => {
    app.listen(port, () => {
      console.log(`🚀 Server ready on http://localhost:${port}`)
    })
  })
  .catch((error) => {
    console.error("❌ Database connection failed:", error)
  })
