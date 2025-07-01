import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { WaitlistData } from '../types/waitlist.types';
import axios from 'axios';

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  
];


const SPREADSHEET_ID = '1EzyTZ1AGUnBZFNW_Q1TMJ8zDjnV6Jhg2fHe8GYCSH60';
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDER_EMAIL = process.env.SENDGRID_DE_EMAIL;
const SENDER_NAME = 'Design Elementary';
const credentials = {
  type: "service_account",
  project_id: process.env.GOOGLE_SHEET_PROJECT_ID,
  private_key_id: process.env.GOOGLE_SHEET_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_SHEET_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.GOOGLE_SHEET_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_SHEET_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.GOOGLE_SHEET_CLIENT_EMAIL || "")}`,
  universe_domain: "googleapis.com"
};
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: SCOPES,
});

export async function appendWaitlistToSheet(formData: WaitlistData) {
  const authClient = (await auth.getClient()) as unknown as JWT;
  const sheets = google.sheets({ version: 'v4' });

  const values = [
    [
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
      new Date().toISOString(), // Timestamp
    ],
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1!A:A',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
    auth: authClient as any,
  });
}

export async function sendSheetLinkToAdmin() {
  const data = {
    personalizations: [
      {
        to: [{ email: 'subhankar@designelementary.com' }],
        subject: 'Google Sheet Link for Waitlist',
      },
    ],
    from: {
      email: SENDER_EMAIL,
      name: SENDER_NAME,
    },
    content: [
      {
        type: 'text/plain',
        value: 'Here is the link to the waitlist Google Sheet: https://docs.google.com/spreadsheets/d/1EzyTZ1AGUnBZFNW_Q1TMJ8zDjnV6Jhg2fHe8GYCSH60/edit?gid=0',
      },
    ],
  };

  await axios.post('https://api.sendgrid.com/v3/mail/send', data, {
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });
} 