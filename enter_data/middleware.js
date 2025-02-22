const axios = require("axios");

async function authenticateToken(req, res, next) {
    let token = req.cookies.token || req.cookies.access_token_cookie || req.query.token;
    let user_id = req.cookies.user?.id || req.query.id;
    const AUTH_SERVICE_URL = "http://auth_service:5001";

    console.log("Authenticating user..."); 
    console.log("Token received:", token);
    
    if (!token) {
        console.log("No token found. Redirecting to login...");
        return res.redirect("http://127.0.0.1:5001/login");
    }

    try {
        const response = await axios.get(`${AUTH_SERVICE_URL}/protected`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.status === 200) {
            console.log("Token verified! Storing user in cookies.");
            // ✅ Save user in cookies if not already stored
            res.cookie("user", { id: user_id, token: token }, { maxAge: 900000, httpOnly: true });
            req.cookies.user = { id: user_id, token: token }; // ✅ Also store it in `req.cookies`
            next();  // Proceed to the next middleware or route
        }
    } catch (error) {
        console.log("Authentication failed:", error.message);
        return res.status(403).json({ error: "Forbidden" });
    }
}

module.exports = authenticateToken;
