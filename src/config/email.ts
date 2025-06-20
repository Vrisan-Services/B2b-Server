import axios from 'axios';
import dotenv from 'dotenv';
import { WaitlistData } from '../types/waitlist.types';

dotenv.config();

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDER_EMAIL = process.env.SENDGRID_DE_EMAIL;
const SENDER_NAME = 'Design Elementary';

const getEmailTemplate = (otp: string, type: 'verification' | 'login') => {
  const title = type === 'verification' ? 'Email Verification' : 'Login OTP';
  const message = type === 'verification' 
    ? 'Please use the following OTP to verify your email address'
    : 'Please use the following OTP to login to your account';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            padding: 20px 0;
            background-color: #4a90e2;
            border-radius: 8px 8px 0 0;
            margin: -20px -20px 20px -20px;
          }
          .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 20px;
            color: #333333;
          }
          .otp-container {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 6px;
          }
          .otp {
            font-size: 32px;
            font-weight: bold;
            color: #4a90e2;
            letter-spacing: 5px;
            margin: 10px 0;
          }
          .message {
            text-align: center;
            color: #666666;
            margin-bottom: 20px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #666666;
            font-size: 12px;
            border-top: 1px solid #eeeeee;
            margin-top: 20px;
          }
          .expiry {
            color: #ff6b6b;
            font-size: 14px;
            text-align: center;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${title}</h1>
          </div>
          <div class="content">
            <p class="message">${message}</p>
            <div class="otp-container">
              <div class="otp">${otp}</div>
            </div>
            <p class="expiry">This OTP will expire in 10 minutes</p>
          </div>
          <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} Design Elementary. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

const getWaitlistEmailTemplate = (formData: WaitlistData) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>New B2B Waitlist Submission</title>
      </head>
      <body>
        <h1>New B2B Waitlist Submission</h1>
        <p><strong>Full Name:</strong> ${formData.fullName}</p>
        <p><strong>Company Name:</strong> ${formData.companyName}</p>
        <p><strong>Role:</strong> ${formData.role}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Phone Number:</strong> ${formData.phoneNumber || 'N/A'}</p>
        <p><strong>City:</strong> ${formData.city || 'N/A'}</p>
        <p><strong>State:</strong> ${formData.state || 'N/A'}</p>
        <p><strong>Project Size:</strong> ${formData.projectSize}</p>
        <p><strong>Annual Project Volume:</strong> ${formData.annualProjectVolume || 'N/A'}</p>
        <p><strong>Project Types:</strong> ${formData.projectTypes.join(', ')}</p>
        <p><strong>Design Support Needed:</strong> ${formData.designSupportNeeded.join(', ')}</p>
        <p><strong>Additional Notes:</strong> ${formData.additionalNotes || 'N/A'}</p>
      </body>
    </html>
  `;
};

const getWaitlistCSV = (formData: WaitlistData) => {
  const headers = [
    'Full Name',
    'Company Name',
    'Role',
    'Email',
    'Phone Number',
    'City',
    'State',
    'Project Size',
    'Annual Project Volume',
    'Project Types',
    'Design Support Needed',
    'Additional Notes',
  ];
  const values = [
    formData.fullName,
    formData.companyName,
    formData.role,
    formData.email,
    formData.phoneNumber || '',
    formData.city || '',
    formData.state || '',
    formData.projectSize,
    formData.annualProjectVolume || '',
    (formData.projectTypes || []).join(', '),
    (formData.designSupportNeeded || []).join(', '),
    formData.additionalNotes || '',
  ];
  return `${headers.join(',')}` + '\n' + values.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
};

export const sendVerificationEmail = async (email: string, otp: string) => {
  const data = {
    personalizations: [
      {
        to: [{ email: email }],
        subject: 'Email Verification OTP',
      },
    ],
    from: {
      email: SENDER_EMAIL,
      name: SENDER_NAME,
    },
    content: [
      {
        type: 'text/html',
        value: getEmailTemplate(otp, 'verification'),
      },
    ],
  };

  try {
    await axios.post('https://api.sendgrid.com/v3/mail/send', data, {
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const sendLoginOTP = async (email: string, otp: string) => {
  const data = {
    personalizations: [
      {
        to: [{ email: email }],
        subject: 'Login OTP',
      },
    ],
    from: {
      email: SENDER_EMAIL,
      name: SENDER_NAME,
    },
    content: [
      {
        type: 'text/html',
        value: getEmailTemplate(otp, 'login'),
      },
    ],
  };

  try {
    await axios.post('https://api.sendgrid.com/v3/mail/send', data, {
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const sendWaitlistSubmissionEmail = async (email:string,fullName:string, formData: WaitlistData) => {
  const data = {
    personalizations: [
      {
        to: [{ email: process.env.WAITLIST_RECIPIENT_EMAIL }],
        subject: `New B2B Waitlist Submission from ${formData.companyName}`,
      },
    ],
    from: {
      email: SENDER_EMAIL,
      name: SENDER_NAME,
    },
    reply_to: {
      email: formData.email,
      name: formData.fullName,
    },
    content: [
      {
        type: 'text/html',
        value: getWaitlistEmailTemplate(formData),
      },
    ],
    attachments: [
      {
        content: Buffer.from(getWaitlistCSV(formData)).toString('base64'),
        filename: `waitlist-${formData.companyName.replace(/\s+/g, '_')}.csv`,
        type: 'text/csv',
        disposition: 'attachment',
      },
    ],
  };

  try {
    await axios.post('https://api.sendgrid.com/v3/mail/send', data, {
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    return true;
  } catch (error) {
    console.error('Error sending waitlist email:', error);
    return false;
  }
};