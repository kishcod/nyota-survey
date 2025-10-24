# Nyota Youth Empowerment - Survey (Ready-to-deploy)

**Personalised for your inputs**
- Organization: Nyota Youth Empowerment
- Personal till (entered by user): 8160572
- Grant amount shown to users: KES 50,000
- Activation fee (STK push amount): KES 50

## How to use

1. Copy `.env.example` to `.env` and fill your Daraja credentials:
   - `CONSUMER_KEY`, `CONSUMER_SECRET`
   - `SHORTCODE` (default in file is 8160572; for sandbox testing use 174379)
   - `PASSKEY` (sandbox passkey if using 174379, or live passkey if using your real till)
   - `CALLBACK_URL` should point to `https://<your-public-url>/api/stk-callback` (ngrok/grok/cloudflared or deployed backend)

2. Install dependencies:
   ```
   npm install
   ```

3. Run locally:
   ```
   npm run dev
   ```
   Expose your local server with ngrok/grok/cloudflared to receive STK callbacks:
   ```
   ngrok http 3000
   ```

4. Sandbox testing notes:
   - To test on Safaricom Sandbox, set `SHORTCODE=174379` and use the sandbox PASSKEY:
     `bfb279f9aa9bdbcf158e97dd71a467cd2c7e1a0f02d5c9e7b379b472f37a0d46`
   - Use the test phone number: `254708374149`

5. Deploying:
   - Push to GitHub.
   - Deploy backend on Render/Railway as a Web Service; add environment variables there (CONSUMER_KEY, CONSUMER_SECRET, PASSKEY, SHORTCODE, CALLBACK_URL).
   - Optionally host static frontend on GitHub Pages and point API calls to your deployed backend.

## Notes about using your personal till (8160572)
- If you plan to process **real payments**, you must obtain **live Daraja credentials** and a **passkey** from Safaricom (contact apisupport@safaricom.co.ke).
- Do NOT use sandbox credentials with a real till — that will fail.

## File structure
- server.js — Express + STK push route
- public/ — static frontend (index.html, qualified.html, payment.html, wait.html)
- data/ — local storage for survey responses and callbacks (for demo only)

