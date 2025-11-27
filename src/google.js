const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

console.log("CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("SECRET:", process.env.GOOGLE_CLIENT_SECRET);
module.exports = oauth2Client;
