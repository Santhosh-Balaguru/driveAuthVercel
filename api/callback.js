export default async function handler(req, res) {
	const code = req.query.code;
	if (!code) return res.status(400).send("Missing authorization code");

	const client_id = process.env.GOOGLE_CLIENT_ID;
	const client_secret = process.env.GOOGLE_CLIENT_SECRET;
	const redirect_uri = `https://${req.headers.host}/api/callback`;

	try {
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

		const token = await tokenRes.json();

		if (token.access_token) {
			const safe = JSON.stringify(token).replace(/</g, "\\u003c"); // avoid XSS

			res.setHeader("Content-Type", "text/html");
			res.send(`
				<!DOCTYPE html>
				<html>
				<head><title>Token Sent</title></head>
				<body>
					<h2>✅ Token received</h2>
					<p>Sending token to Obsidian...</p>
					<script>
						(function() {
							try {
								const token = ${safe};
								window.parent?.postMessage(JSON.stringify(token), "*");
								document.body.innerHTML += "<p>✅ Token sent! Return to the Obsidian app.</p>";
							} catch (err) {
								console.error("[callback] Error:", err);
								window.parent?.postMessage(JSON.stringify({ error: "postMessage error", detail: err.message }), "*");
								document.body.innerHTML = "<h2>❌ Failed to send token</h2><p>" + err.message + "</p>";
							}
						})();
					</script>
				</body>
				</html>
			`);
		} else {
			console.error("[OAuth] Token exchange failed:", token);
			res.status(400).send("❌ Failed to retrieve access token");
		}
	} catch (err) {
		console.error("[OAuth] Server error:", err);
		res.status(500).send("❌ Internal server error");
	}
}
