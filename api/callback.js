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
		// Save to localStorage via browser, then redirect to /post-token
		res.send(`
			<html>
				<body>
					<h2>✅ Auth successful</h2>
					<script>
						const token = ${JSON.stringify(data)};
						localStorage.setItem("gdrive-token", JSON.stringify(token));
						window.location.href = "/post-token";
					</script>
				</body>
			</html>
		`);
	} else {
		res.status(400).send("❌ Token exchange failed");
	}
}
