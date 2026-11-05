import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
  if (!transporter) {
    const required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD"];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(`Missing SMTP configuration: ${missing.join(", ")}`);
    }
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  return transporter;
}

export async function sendOtpEmail({ email, code, purpose }) {
  const subject = purpose === "signup" ? "Verify your InsurChain Health account" : "Reset your InsurChain Health password";
  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject,
    text: `Your InsurChain Health verification code is ${code}. It expires in 10 minutes.`,
    html: `<p>Your InsurChain Health verification code is:</p><p style="font-size:24px;font-weight:700;letter-spacing:6px">${code}</p><p>This code expires in 10 minutes.</p>`,
  });
}
