const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || (() => { throw new Error("EMAIL_HOST is not set"); })(),
  port: process.env.EMAIL_PORT || (() => { throw new Error("EMAIL_PORT is not set"); })(),
  secure: process.env.EMAIL_PORT === "465", // Use SSL for port 465
  auth: {
    user: process.env.EMAIL_USER || (() => { throw new Error("EMAIL_USER is not set"); })(),
    pass: process.env.EMAIL_PASSWORD || (() => { throw new Error("EMAIL_PASS is not set"); })(),
  },
});

const sendEmail = async ({ to, subject, text }) => {
  try {
    const mailOptions = {
      from: `"Omyra Technologies" <${process.env.EMAIL_USER}>`, // Add a friendly name
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw new Error("Failed to send email.");
  }
};

module.exports = sendEmail;
