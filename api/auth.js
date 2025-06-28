export default async function handler(req, res) {
	const client_id = process.env.GOOGLE_CLIENT_ID;
	if (!client_id) {
		return res.status(500).send("Missing GOOGLE_CLIENT_ID in environment.");
	}

	// Build redirect_uri dynamically based on Vercel deployment
	const redirect_uri = `https://${req.headers.host}/api/callback`;

	const scope = encodeURIComponent([
		"https://www.googleapis.com/auth/drive.readonly",
		"https://www.googleapis.com/auth/userinfo.profile"
	].join(" "));

	const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;

	// Redirect to Google OAuth URL
	res.writeHead(302, { Location: authUrl });
	res.end();
}
