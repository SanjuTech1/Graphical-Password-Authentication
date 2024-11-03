import * as dotenv from "dotenv";
import { createTransport } from "nodemailer";

// Load environment variables from .env file
dotenv.config();

// Create a transporter object using Gmail service
const transporter = createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER, // Your Gmail address
    pass: process.env.SMTP_PASSWORD, // Your Gmail password or App Password
  },
});

// Mail options including sender, recipient, subject, and text
const mailOptions = {
  from: process.env.SMTP_USER, // Using the variable for consistency
  to: "sanjusajeev055@gmail.com", // Recipient email address
  subject: "Test Email",
  text: "This is a test email sent using Nodemailer.",
};

// Function to send email
const sendEmail = () => {
  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.error("Error sending email:", err);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

// Call the function to send the email
sendEmail();

export { transporter }; // Export the transporter if needed elsewhere
