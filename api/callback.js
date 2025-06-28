export default async function handler(req, res) {
  const code = req.query.code;
  if (!code) return res.status(400).send("Missing code");

  const client_id = process.env.GOOGLE_CLIENT_ID;
  const client_secret = process.env.GOOGLE_CLIENT_SECRET;
  const redirect_uri = `https://${req.headers.host}/api/callback`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id,
      client_secret,
      code,
      redirect_uri,
      grant_type: "authorization_code"
    })
  });

  const data = await tokenRes.json();

  if (data.access_token) {
    res.send(`
      <h2>✅ Auth Successful</h2>
      <p><strong>Access Token:</strong></p>
      <pre>${data.access_token}</pre>
      <p><strong>Refresh Token:</strong></p>
      <pre>${data.refresh_token || "(Already granted once)"}</pre>
      <p>Copy these tokens into your Obsidian plugin settings.</p>
    `);
  } else {
    res.status(400).send("❌ Token exchange failed");
  }
}
