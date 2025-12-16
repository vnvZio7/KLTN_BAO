import nodemailer from "nodemailer";
// Tạo transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export function sendMail({ to, subject, html }) {
  return transporter.sendMail({
    from: `"Pomera" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}
