const readline = require("readline")
const fs = require("fs")
const path = require("path")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

console.log("🚀 AptitudePro+ Email Setup")
console.log("================================\n")

console.log("To send verification emails, you need to configure Gmail:")
console.log("1. Enable 2-factor authentication on your Gmail account")
console.log('2. Generate an "App Password" for this application')
console.log("3. Use the app password (not your regular password)\n")

const questions = ["Enter your Gmail address: ", "Enter your Gmail app password: "]

const answers = []
let currentQuestion = 0

function askQuestion() {
  if (currentQuestion < questions.length) {
    rl.question(questions[currentQuestion], (answer) => {
      answers.push(answer.trim())
      currentQuestion++
      askQuestion()
    })
  } else {
    // Create or update .env file
    const envPath = path.join(__dirname, "..", ".env")
    let envContent = ""

    // Read existing .env if it exists
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf8")
    }

    // Update or add email configuration
    const emailUser = `EMAIL_USER=${answers[0]}`
    const emailPass = `EMAIL_PASS=${answers[1]}`

    if (envContent.includes("EMAIL_USER=")) {
      envContent = envContent.replace(/EMAIL_USER=.*/, emailUser)
    } else {
      envContent += `\n${emailUser}`
    }

    if (envContent.includes("EMAIL_PASS=")) {
      envContent = envContent.replace(/EMAIL_PASS=.*/, emailPass)
    } else {
      envContent += `\n${emailPass}`
    }

    // Write updated .env file
    fs.writeFileSync(envPath, envContent.trim() + "\n")

    console.log("\n✅ Email configuration saved to .env file")
    console.log("🔄 Please restart your server for changes to take effect")
    console.log("\nTo test email sending, try signing up with a new account.")

    rl.close()
  }
}

askQuestion()
