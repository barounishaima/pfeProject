import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Email sending function
export const sendAccountCredentials = async (email, password) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Account Credentials',
      text: `Here are your login credentials:\nEmail: ${email}\nPassword: ${password}`,
      html: `<p>Here are your login credentials:</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Password:</strong> ${password}</p>`
    };

    await transporter.sendMail(mailOptions);
    console.log('Credentials email sent to', email);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Rethrow to handle in calling function
  }
};

export default sendAccountCredentials;