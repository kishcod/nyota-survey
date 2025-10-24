const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
const shortid = require('shortid');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_FILE = path.join(__dirname, 'data', 'surveys.json');

// ensure data folder exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// save survey
app.post('/api/survey', (req, res) => {
  const payload = req.body;
  payload.id = shortid.generate();
  payload.createdAt = new Date().toISOString();
  const arr = JSON.parse(fs.readFileSync(DATA_FILE));
  arr.push(payload);
  fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2));
  res.json({ ok: true, id: payload.id });
});

// simple endpoint to fetch surveys
app.get('/api/surveys', (req, res) => {
  const arr = JSON.parse(fs.readFileSync(DATA_FILE));
  res.json(arr);
});

// STK Push initiation (Daraja sandbox / live)
// NOTE: you must fill environment variables: CONSUMER_KEY, CONSUMER_SECRET, SHORTCODE, PASSKEY, CALLBACK_URL
app.post('/api/stk-push', async (req, res) => {
  const { phone, amount, accountRef, transactionDesc } = req.body;
  if (!phone || !amount) return res.status(400).json({ error: 'phone and amount required' });

  try {
    // 1. get OAuth token
    const tokenResp = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      auth: {
        username: process.env.CONSUMER_KEY,
        password: process.env.CONSUMER_SECRET
      }
    });
    const accessToken = tokenResp.data.access_token;

    // 2. create password
    const shortcode = process.env.SHORTCODE;
    const passkey = process.env.PASSKEY;
    const timestamp = new Date().toISOString().replace(/[-T:\.Z]/g,'').slice(0,14);
    const password = Buffer.from(shortcode + passkey + timestamp).toString('base64');

    const stkRequest = {
      "BusinessShortCode": shortcode,
      "Password": password,
      "Timestamp": timestamp,
      "TransactionType": "CustomerPayBillOnline",
      "Amount": amount,
      "PartyA": phone.replace(/\D/g,''),
      "PartyB": shortcode,
      "PhoneNumber": phone.replace(/\D/g,''),
      "CallBackURL": process.env.CALLBACK_URL,
      "AccountReference": accountRef || "NyotaSurvey",
      "TransactionDesc": transactionDesc || "Nyota grant activation fee"
    };

    const resp = await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', stkRequest, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    return res.json({ ok: true, data: resp.data });
  } catch (err) {
    console.error('STK Error', err.response ? err.response.data : err.message);
    return res.status(500).json({ error: 'STK push failed', detail: err.response ? err.response.data : err.message });
  }
});

// placeholder for STK callback. Safaricom will POST here.
app.post('/api/stk-callback', (req, res) => {
  // store callback for manual review
  const cb = req.body;
  const cbFile = path.join(__dirname, 'data', 'stk_callbacks.json');
  const arr = fs.existsSync(cbFile) ? JSON.parse(fs.readFileSync(cbFile)) : [];
  arr.push({ receivedAt: new Date().toISOString(), body: cb });
  fs.writeFileSync(cbFile, JSON.stringify(arr, null, 2));
  // respond quickly
  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Nyota Survey app listening on ${PORT}`));
