const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Use CORS middleware
app.use(cors());

// Middleware to parse incoming JSON data
app.use(bodyParser.json());

// Set up Google Sheets API
const sheets = google.sheets({ version: 'v4' });

const auth = new google.auth.GoogleAuth({
  credentials: {
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
const range = 'Sheet1!A:C'; // Assuming the Google Sheet has columns for Name, Email, and Number

// POST endpoint to handle form submission
app.post('/api/submitForm', async (req, res) => {
  const { name, email, number } = req.body;

  // Validate the fields
  if (!name || !email || !number) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Authenticate and append data to the Google Sheet
    const authClient = await auth.getClient();
    await sheets.spreadsheets.values.append({
      auth: authClient,
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[name, email, number]],
      },
    });

    return res.status(200).json({ message: 'Form submitted successfully' });
  } catch (error) {
    console.error('Error submitting form:', error);
    return res.status(500).json({ error: 'Failed to submit form' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
