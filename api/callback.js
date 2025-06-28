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
			const safe = JSON.stringify(token).replace(/</g, "\\u003c");

			res.setHeader("Content-Type", "text/html");
			res.send(`
				<!DOCTYPE html>
				<html>
				<head><title>Auth Successful</title></head>
				<body>
					<h2>✅ Auth successful</h2>
					<script>
						const token = ${safe};
						localStorage.setItem("gdrive-token", JSON.stringify(token));
						if (window.parent) {
							window.parent.postMessage(JSON.stringify(token), "*");
							console.log("[callback] Sent token to parent");
						}
					</script>
					<p>You can now return to the Obsidian app.</p>
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
