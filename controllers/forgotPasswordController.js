const bcrypt = require("bcrypt")
const crypto = require("crypto")
const { User, Admin, sequelize } = require("../models")
const sendPasswordResetEmail = require("../services/passwordResetMailer")

const forgotPassword = async (req, res) => {
  const { email, userType } = req.body

  if (!email || !userType) {
    req.session.error = "Email and account type are required."
    return res.redirect("/forgot-password")
  }

  const Model = userType === "admin" ? Admin : User

  try {
    // First, check if the user exists
    const account = await Model.findOne({ where: { email } })

    if (!account) {
      // Don't reveal that the email doesn't exist for security
      req.session.success = "If an account with that email exists, a password reset link has been sent."
      return res.redirect("/forgot-password")
    }

    if (!account.isVerified) {
      req.session.error = "Please verify your email first before resetting password."
      return res.redirect("/forgot-password")
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Save reset token to database
    try {
      await Model.update(
        {
          resetToken: resetToken,
          resetTokenExpiry: resetTokenExpiry,
        },
        {
          where: { id: account.id },
        },
      )
    } catch (updateError) {
      console.error("Database update error:", updateError)
      req.session.error = "Database error. Please try again."
      return res.redirect("/forgot-password")
    }

    // Send password reset email
    try {
      const emailResult = await sendPasswordResetEmail(email, resetToken, userType === "admin")

      if (emailResult.success) {
        req.session.success = "Password reset link sent to your email. Please check your inbox."
      } else {
        // For development - provide console link
        const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`
        console.log(`🔗 Password reset link: ${resetLink}`)
        req.session.success = "Password reset link generated. Check server console for the link."
      }
    } catch (emailError) {
      console.error("Email error:", emailError)
      const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`
      console.log(`🔗 Password reset link: ${resetLink}`)
      req.session.success = "Password reset link generated. Check server console for the link."
    }

    res.redirect("/forgot-password")
  } catch (error) {
    console.error("Forgot password error:", error)
    req.session.error = "Something went wrong. Please try again."
    res.redirect("/forgot-password")
  }
}

const resetPassword = async (req, res) => {
  const { token, password, confirmPassword } = req.body

  if (!token || !password || !confirmPassword) {
    req.session.error = "All fields are required."
    return res.redirect(`/reset-password?token=${token}`)
  }

  if (password !== confirmPassword) {
    req.session.error = "Passwords do not match."
    return res.redirect(`/reset-password?token=${token}`)
  }

  if (password.length < 6) {
    req.session.error = "Password must be at least 6 characters long."
    return res.redirect(`/reset-password?token=${token}`)
  }

  try {
    // Try to find user or admin with this token
    let account = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: { [require("sequelize").Op.gt]: new Date() },
      },
    })

    if (!account) {
      account = await Admin.findOne({
        where: {
          resetToken: token,
          resetTokenExpiry: { [require("sequelize").Op.gt]: new Date() },
        },
      })
    }

    if (!account) {
      req.session.error = "Invalid or expired reset token."
      return res.redirect("/forgot-password")
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update password and clear reset token
    await account.update({
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    })

    req.session.success = "Password reset successfully! You can now log in with your new password."
    res.redirect("/login")
  } catch (error) {
    console.error("Reset password error:", error)
    req.session.error = "Something went wrong. Please try again."
    res.redirect(`/reset-password?token=${token}`)
  }
}

module.exports = { forgotPassword, resetPassword }
