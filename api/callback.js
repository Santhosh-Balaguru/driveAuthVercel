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
			const safe = JSON.stringify(token).replace(/</g, "\\u003c"); // prevent XSS

			res.setHeader("Content-Type", "text/html");
			res.send(`
				<!DOCTYPE html>
				<html>
				<head><title>Token Received</title></head>
				<body>
					<h2>✅ Token received</h2>
					<p>Sending token to parent window...</p>
					<script>
						(function() {
							try {
								const token = ${safe};
								window.parent?.postMessage(JSON.stringify(token), "*");
								document.body.innerHTML += "<p>✅ Sent! You can return to Obsidian.</p>";
							} catch (err) {
								document.body.innerHTML = "<h2>❌ Failed to send token</h2><pre>" + err.message + "</pre>";
								window.parent?.postMessage(JSON.stringify({ error: "postMessage error", detail: err.message }), "*");
							}
						})();
					</script>
				</body>
				</html>
			`);
		} else {
			console.error("[OAuth] Failed to retrieve token:", token);
			res.status(400).send("❌ Failed to retrieve access token");
		}
	} catch (err) {
		console.error("[OAuth] Error during token exchange:", err);
		res.status(500).send("❌ Internal Server Error");
	}
}
