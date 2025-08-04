const nodemailer = require("nodemailer")
require("dotenv").config()

const createTransporter = async () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    })

    await transporter.verify()
    return transporter
  } catch (error) {
    return null
  }
}

const sendPasswordResetEmail = async (to, token, isAdmin = false) => {
  const transporter = await createTransporter()

  if (!transporter) {
    const resetLink = `http://localhost:3000/reset-password?token=${token}`

    return {
      success: false,
      developmentMode: true,
      developmentLink: resetLink,
    }
  }

  const resetLink = `http://localhost:3000/reset-password?token=${token}`

  const mailOptions = {
    from: {
      name: "AptitudePro+",
      address: process.env.EMAIL_USER,
    },
    to: to,
    subject: "🔐 Reset Your AptitudePro+ Password",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password - AptitudePro+</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #e74c3c, #c0392b); padding: 40px 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
                      🔐 Password Reset
                    </h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
                      Secure your AptitudePro+ account
                    </p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">
                      Reset Your Password 🔑
                    </h2>
                    
                    <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                      We received a request to reset your password. Click the button below to create a new password. 
                      This link will expire in 1 hour for security.
                    </p>
                    
                    <!-- Reset Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${resetLink}" 
                             style="display: inline-block; 
                                    background: linear-gradient(135deg, #e74c3c, #c0392b); 
                                    color: white; 
                                    text-decoration: none; 
                                    padding: 15px 40px; 
                                    border-radius: 50px; 
                                    font-weight: bold; 
                                    font-size: 18px;
                                    box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);">
                            🔑 Reset My Password
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #999; font-size: 14px; text-align: center; margin: 30px 0 20px 0;">
                      Button not working? Copy and paste this link:
                    </p>
                    
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #e74c3c; margin: 20px 0;">
                      <a href="${resetLink}" style="color: #e74c3c; word-break: break-all; text-decoration: none;">
                        ${resetLink}
                      </a>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eee;">
                    <p style="color: #999; font-size: 14px; margin: 0 0 10px 0;">
                      ⏰ <strong>This link expires in 1 hour</strong>
                    </p>
                    <p style="color: #999; font-size: 12px; margin: 0;">
                      If you didn't request this reset, please ignore this email.
                    </p>
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                      <p style="color: #e74c3c; font-weight: bold; margin: 0; font-size: 16px;">
                        🔐 AptitudePro+ Security Team
                      </p>
                    </div>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      developmentLink: resetLink,
    }
  }
}

module.exports = sendPasswordResetEmail
