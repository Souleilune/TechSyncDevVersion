const { google } = require('googleapis');
const readline = require('readline');
const fs = require('fs');

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
const TOKEN_PATH = 'gmail_token.json';

// Load credentials from the file you downloaded
const credentials = require('./credentials.json');

const { client_secret, client_id, redirect_uris } = credentials.installed;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

async function getAccessToken() {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Authorize this app by visiting this url:', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
      console.log('Token stored to', TOKEN_PATH);
      console.log('\nAdd these to your .env file:');
      console.log(`GMAIL_CLIENT_ID=${client_id}`);
      console.log(`GMAIL_CLIENT_SECRET=${client_secret}`);
      console.log(`GMAIL_REDIRECT_URI=${redirect_uris[0]}`);
      console.log(`GMAIL_REFRESH_TOKEN=${token.refresh_token}`);
    });
  });
}

getAccessToken();