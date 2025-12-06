import nodemailer from 'nodemailer';

// Create reusable email transporter
const createTransporter = async () => {
  // Development: Use Ethereal (fake email SMTP)
  if (process.env.NODE_ENV === 'development') {
    console.log("Using Ethereal test email service...");

    // Create an Ethereal test account automatically if not provided
    const testAccount = await nodemailer.createTestAccount();

    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }

  // Production: Use real SMTP (Gmail, Outlook, etc.)
  console.log("Using real SMTP email service...");

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // false for port 587, true for 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send Email Function
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: `"MediFlow HMS" <${process.env.EMAIL_FROM || 'noreply@mediflow.com'}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email Message ID:", info.messageId);

    // Ethereal Preview URL (only development mode)
    if (process.env.NODE_ENV === 'development') {
      console.log("Ethereal Preview URL:", nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error("Email could not be sent");
  }
};
