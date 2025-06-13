require("dotenv").config();
const path = require("path");
const express = require("express");
const mysql = require("mysql2");
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
const jwt = require("jsonwebtoken");

const session_server = `http://127.0.0.1:8080`;

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "cloudtubes",
});

db.connect((err) => {
  if (err) {
    console.error("Koneksi ke database gagal:", err);
    return;
  }
  console.log("Berhasil terhubung ke database MySQL.");
});

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

async function valid_session(req, res) {
  let valid = false;
  const token = req.session.token;
  if (token) {
    await axios
      .get(
        `${egeos_server}/api/auth/api_router.php?endpoint=validate_session&token=${token}`
      )
      .then((data) => {
        if (data.status == 200) {
          valid = true;
        } else {
          valid = false;
        }
      })
      .catch((error) => {
        console.log(error);
        valid = false;
      });
  } else {
    return valid;
  }
  return valid;
}

app.get("/", (req, res) => {
  res.render("index", { title: "Welcome to the Server" });
});

app.get("/signin", (req, res) => {
  res.render("signin", { title: "Welcome to the Server" });
});

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  const body = { email: email, password: password };

  try {
    const response = await axios.post(`${session_server}/login`, body);
    const token = response.data.token;
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: true, // aktifkan jika menggunakan HTTPS
      sameSite: "Strict",
    });
    res.status(200).send({ message: "Login berhasil" });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error(`Error ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      console.error("Tidak ada respons dari server:", error.request);
    } else {
      console.error("Terjadi kesalahan saat mengirim request:", error.message);
    }
  }
});

app.get("/signup", (req, res) => {
  res.render("signup", { title: "Welcome to the Server" });
});

app.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;

  const body = { email: email, password: password, name: name };

  try {
    const response = await axios.post(`${session_server}/register`, body);
    res.redirect("/signin");
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
  const token = req.cookies.auth_token;
  console.log(token);
  if (!token) {
    return res.redirect("/signin");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const isAdmin = decoded.is_admin;

    if (isAdmin === 1) {
      res.render("admin", { user: decoded });
    } else {
      res.render("dashboard", { user: decoded });
    }
  } catch (error) {
    console.error("JWT tidak valid:", error.message);
    return res.redirect("/signin");
  }
});

app.delete("/login", (req, res) => {
  console.log("User logged out");
  req.session.token = null;
  res.status(200).json({ message: "Logged out successfully" });
});

app.post("/project", async (req, res) => {
  const { projectname, description } = req.body;
  const token = req.session.token;
  const json = JSON.stringify({
    data: {
      token: token,
      title: projectname,
      description: description,
    },
    method: "CREATE",
  });
  const projects = await axios.post(`${egeos_server}/api/gis/api.php`, json);
  res.redirect("/pm");
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Example app listening on port http://localhost:3000");
});
