export default async function handler(req, res) {
	const code = req.query.code;
	if (!code) return res.status(400).send("Missing code");

	const client_id = process.env.GOOGLE_CLIENT_ID;
	const client_secret = process.env.GOOGLE_CLIENT_SECRET;
	const redirect_uri = `https://${req.headers.host}/api/callback`;

	// Exchange authorization code for tokens
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
		// Build redirect URL with tokens in hash
		const hash = new URLSearchParams({
			access_token: data.access_token,
			refresh_token: data.refresh_token || ""
		}).toString();

		const redirectTo = `https://${req.headers.host}/post-token#${hash}`;
		res.writeHead(302, { Location: redirectTo });
		res.end();
	} else {
		console.error("OAuth token exchange failed:", data);
		res.status(400).send("❌ Token exchange failed. Please try again.");
	}
}
