// app.js
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();              // Create an Express application

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

// Middleware configuration
app.use(express.json());            // Parse incoming JSON requests
app.use(express.urlencoded({ extended: false }));  // Parse URL-encoded data
app.use(cors());                    // Enable CORS for cross-origin requests

app.use(express.static(path.join(__dirname, "../../public")));
// app.use(express.static('public'));

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

app.get("/user", (req, res) => {
  res.render("user", { title: "Welcome to the Server" });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;