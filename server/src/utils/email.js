import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  // For development, use ethereal email (fake SMTP)
  if (process.env.NODE_ENV === 'development') {
    // You can create a test account at https://ethereal.email/
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.EMAIL_USER || 'ethereal.user@ethereal.email',
        pass: process.env.EMAIL_PASS || 'ethereal.password'
      }
    });
  }

  // For production, use your actual SMTP service
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"MediFlow HMS" <${process.env.EMAIL_FROM || 'noreply@mediflow.com'}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Message sent: %s', info.messageId);
    
    // Preview URL for Ethereal (development)
    if (process.env.NODE_ENV === 'development') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};
