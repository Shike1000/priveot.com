require("dotenv").config();
const express = require("express");
const axios = require("axios");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = 3000;

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET;

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.static("public"));

// Middleware para proteger rutas
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).send("No autenticado.");
  }
  next();
}

app.get("/", (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, "public", "logged-in.html"));
  } else {
    res.sendFile(path.join(__dirname, "public", "login.html"));
  }
});

app.get("/login", (req, res) => {
  const redirect = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=read:user`;
  res.redirect(redirect);
});

app.get("/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    const access_token = tokenRes.data.access_token;

    const userRes = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    req.session.user = userRes.data;
    res.redirect("/");
  } catch (err) {
    console.error("Error en OAuth callback:", err.response?.data || err.message);
    res.status(500).send("Error durante el login.");
  }
});

app.get("/user", requireLogin, (req, res) => {
  res.json(req.session.user);
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
