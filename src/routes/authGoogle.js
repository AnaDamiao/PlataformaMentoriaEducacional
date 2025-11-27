const express = require("express");
const router = express.Router();
const oauth2Client = require("../google");
const { google } = require("googleapis");

router.get("/google", (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: [
            "https://www.googleapis.com/auth/calendar",
            "https://www.googleapis.com/auth/calendar.events"
        ]
    });
    res.redirect(url);
});

router.get("/google/callback", async (req, res) => {
    const code = req.query.code;

    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        //  Salvando o token localmente
        const fs = require("fs");
        fs.writeFileSync("google-tokens.json", JSON.stringify(tokens, null, 2));

        res.send("Tokens do Google salvos! Agora seu sistema pode criar reuniões REAL.");
    } catch (e) {
        res.status(500).send("Erro ao autenticar Google");
    }
});

module.exports = router;
