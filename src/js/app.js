const path = require("path");
const express = require("express");
const app = express();
const methodOverride = require("method-override");
const axios = require("axios");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const { error } = require("console");
const upload = multer();
const fs = require("fs");
const cors = require("cors");
const { name } = require("ejs");

const session_server = `http://127.0.0.1:8080`;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));
app.use(express.static(path.join(__dirname, "../../public")));
app.set("trust proxy", true);

app.use(express.static(path.join(__dirname, "/static")));
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());
app.use(methodOverride("_method"));
app.use(cookieParser());
app.use(cors());

// Routes
app.get("/", (req, res) => {
  res.render("index", { title: "Welcome to the Server" });
});

app.get("/signin", (req, res) => {
  res.render("signin", { title: "Welcome to the Server" });
});

app.get("/signup", (req, res) => {
  res.render("signup", { title: "Welcome to the Server" });
});

app.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;

  const body = { email: email, password: password, name: name };

  try {
    const response = await axios.post(`${session_server}/register`, body);
    res.redirect("signin");
    return response.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 409) {
        console.error("Email sudah terdaftar.");
        res.sendStatus(409);
      } else {
        console.error(`Error ${error.response.status}:`, error.response.data);
        res.send({ error: [{ status: 500, detail: error.response.data }] });
      }
    } else if (error.request) {
      console.error("Tidak ada respons dari server:", error.request);
      res.sendStatus(500);
    } else {
      console.error("Terjadi kesalahan saat mengirim request:", error.message);
      res.sendStatus(500);
    }
  }
});

app.get("/dashboard", (req, res) => {
  res.render("dashboard", { title: "Welcome to the Server" });
});

app.get("/dashboardAdmin", (req, res) => {
  res.render("dashboardAdmin", { title: "Welcome to the Server" });
});

app.get("/dashboardAdmin2", (req, res) => {
  res.render("dashboardAdmin2", { title: "Welcome to the Server" });
});

app.get("/dashboardAdmin3", (req, res) => {
  res.render("dashboardAdmin3", { title: "Welcome to the Server" });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
