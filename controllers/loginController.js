const bcrypt = require("bcrypt")
const { User, Admin } = require("../models")

const login = async (req, res) => {
  const { email, password, userType } = req.body

  if (!email || !password || !userType) {
    req.session.error = "All fields are required."
    return res.redirect("/login")
  }

  try {
    const Model = userType === "admin" ? Admin : User

    // Only select the fields that exist in the database
    const account = await Model.findOne({
      where: { email },
      attributes: ["id", "name", "email", "password", "isVerified", "verificationToken"],
    })

    if (!account) {
      req.session.error = "No account found with that email."
      return res.redirect("/login")
    }

    if (!account.isVerified) {
      req.session.error = "Please verify your email before logging in."
      return res.redirect("/login")
    }

    const passwordMatch = await bcrypt.compare(password, account.password)
    if (!passwordMatch) {
      req.session.error = "Incorrect password."
      return res.redirect("/login")
    }

    // ✅ Proper user session object
    req.session.user = {
      id: account.id,
      name: account.name,
      email: account.email,
      type: userType,
    }

    req.session.success = "Login successful!"
    return res.redirect("/welcome")
  } catch (error) {
    console.error("Login error:", error)
    req.session.error = "Server error. Please try again."
    return res.redirect("/login")
  }
}

module.exports = { login }
