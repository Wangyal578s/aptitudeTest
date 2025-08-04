const bcrypt = require("bcrypt")
const crypto = require("crypto")
const { User, Admin } = require("../models")
const sendVerificationEmail = require("../services/mailer")

const signup = async (req, res) => {
  const { name, email, password, confirmPassword, userType } = req.body

  // Validation
  if (!name || !email || !password || !confirmPassword || !userType) {
    req.session.error = "All fields are required."
    return res.redirect("/signup")
  }

  if (password !== confirmPassword) {
    req.session.error = "Passwords do not match."
    return res.redirect("/signup")
  }

  if (password.length < 3) {
    req.session.error = "Password must be at least 3 characters long."
    return res.redirect("/signup")
  }

  const Model = userType === "admin" ? Admin : User

  try {
    // Check if user already exists
    const existing = await Model.findOne({ where: { email } })
    if (existing) {
      req.session.error = "Email already registered."
      return res.redirect("/signup")
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10)
    const token = crypto.randomBytes(32).toString("hex")

    const newUser = await Model.create({
      name,
      email,
      password: hashedPassword,
      verificationToken: token,
      isVerified: false,
    })

    // Send verification email
    try {
      const emailResult = await sendVerificationEmail(email, token, userType === "admin")

      if (emailResult.success) {
        req.session.success = `Account created successfully! 📧 Please check your email (${email}) for the verification link.`
      } else if (emailResult.developmentMode) {
        // Auto-verify in development mode
        newUser.isVerified = true
        newUser.verificationToken = null
        await newUser.save()

        req.session.success = `Account created and auto-verified! 🎉 You can now log in.`
      } else {
        req.session.error = `Account created but email could not be sent. Please contact support.`
      }
    } catch (emailError) {
      // Auto-verify in development if email fails
      if (process.env.NODE_ENV === "development") {
        newUser.isVerified = true
        newUser.verificationToken = null
        await newUser.save()
        req.session.success = "Account created and auto-verified! You can now log in."
      } else {
        req.session.error = "Account created but verification email failed. Please contact support."
      }
    }

    res.redirect("/login")
  } catch (error) {
    console.error("Signup error:", error)
    req.session.error = "Something went wrong during signup. Please try again."
    return res.redirect("/signup")
  }
}

module.exports = { signup }
