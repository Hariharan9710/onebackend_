import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sharmakarnan16@gmail.com", // 🔹 Replace with your Gmail
    pass: "jpjs aokm qkmk dtqo",  // 🔹 Use Gmail App Password (not your login password)
  },
});

export const sendCandidateMail = async (to, username, password) => {
  const loginLink = "http://localhost:5173/candidate/login"; // 🔹 Your frontend login page URL

  const mailOptions = {
    from: '"Office Management" <sharmakarnan16@gmail.com>',
    to,
    subject: "Your Office Management Login Credentials",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color:#2e7d32;">Welcome to Office Management Portal</h2>
        <p>Dear <strong>${username}</strong>,</p>
        <p>Your account has been created successfully by the Admin. Please use the following credentials to log in:</p>
        <table style="margin: 20px 0; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${to}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Password:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${password}</td>
          </tr>
        </table>
        <p>Click the link below to log in:</p>
        <a href="${loginLink}" style="background-color:#2e7d32; color:white; padding:10px 15px; border-radius:6px; text-decoration:none; font-weight:bold;">Login Now</a>
        <p>If you have any issues logging in, please contact support.</p>
        <br/>
        <p>Best regards,<br/>Office Management Team</p>
        <hr/>
        <small style="color:gray;">© 2025 Office Management System</small>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📩 Mail sent successfully to ${to}`);
  } catch (error) {
    console.error("❌ Error sending mail:", error.message);
  }
};
