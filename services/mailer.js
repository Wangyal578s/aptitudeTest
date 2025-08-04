const nodemailer = require("nodemailer")
require("dotenv").config()

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    })

    return transporter
  } catch (error) {
    return null
  }
}

const sendVerificationEmail = async (to, token, isAdmin = false) => {
  const transporter = createTransporter()
  const baseUrl = isAdmin ? "http://localhost:3000/admin/verify" : "http://localhost:3000/verify"
  const verifyLink = `${baseUrl}?token=${token}`

  if (!transporter) {
    // Development mode - return link for console
    console.log(`🔗 Verification link: ${verifyLink}`)
    return {
      success: false,
      developmentLink: verifyLink,
      developmentMode: true,
    }
  }

  try {
    await transporter.verify()
  } catch (verifyError) {
    // Email service failed - return development link
    console.log(`🔗 Verification link: ${verifyLink}`)
    return {
      success: false,
      developmentLink: verifyLink,
      error: verifyError.message,
    }
  }

  const mailOptions = {
    from: `"AptitudePro+" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verify your email - AptitudePro+",
    html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin-bottom: 10px;">Welcome to AptitudePro+! 🎉</h1>
          <p style="color: #7f8c8d; font-size: 16px;">Thank you for registering with us!</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 30px; border-radius: 10px; margin-bottom: 30px; color: white;">
          <p style="font-size: 16px; margin-bottom: 20px; text-align: center;">
            Please click the button below to verify your email address and activate your account:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyLink}" 
               style="display: inline-block; 
                      background: rgba(255, 255, 255, 0.2); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold;
                      font-size: 16px;
                      border: 2px solid rgba(255, 255, 255, 0.3);
                      transition: all 0.3s ease;">
              ✅ Verify Email Address
            </a>
          </div>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="color: #6c757d; font-size: 14px; margin-bottom: 10px;">
            <strong>If the button doesn't work, copy and paste this URL in your browser:</strong>
          </p>
          <p style="color: #007bff; font-size: 14px; word-break: break-all; background: white; padding: 10px; border-radius: 4px;">
            ${verifyLink}
          </p>
        </div>
        
        <div style="text-align: center; color: #6c757d; font-size: 12px; border-top: 1px solid #dee2e6; padding-top: 20px;">
          <p><strong>⏰ This verification link will expire in 24 hours.</strong></p>
          <p>If you didn't create an account, please ignore this email.</p>
          <p style="margin-top: 15px;">
            <strong>AptitudePro+ Team</strong><br>
            Your Gateway to Success! 🚀
          </p>
        </div>
      </div>
    </div>
  `,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    // Email failed - return development link
    console.log(`🔗 Verification link: ${verifyLink}`)
    return {
      success: false,
      error: error.message,
      developmentLink: verifyLink,
    }
  }
}

module.exports = sendVerificationEmail
