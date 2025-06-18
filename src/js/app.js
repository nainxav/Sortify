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
// const session_server = `http://3.27.193.215:8080`;

const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "cloudtubes",
});

// const db = mysql.createConnection({
//   host: "database-1.c7swuaqoevmy.ap-southeast-2.rds.amazonaws.com",
//   user: "root",
//   password: "123123123",
//   database: "cloudtubes",
// });

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

async function asyncQuery(query) {
  try {
    const [results] = await db.promise().query(query);
    return results; // hasil query
  } catch (err) {
    console.error("Gagal mengambil data :", err);
    throw err;
  }
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
      secure: false, // aktifkan jika menggunakan HTTPS
      sameSite: "Lax",
    });
    res.status(303).redirect("/dashboard");
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

app.delete("/signin", (req, res) => {
  console.log("User logged out");
  res.clearCookie("auth_token");
  res.status(303).redirect("/signin");
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

    let user;
    let pickups;
    let donePickup;
    let cancelledPickup;
    let pendingPickup;

    const userId = decoded.user_id;
    const userQuery =
      "SELECT id,name,email,is_admin,created_at,updated_at,longitude,latitude,alamat FROM users WHERE id = ?";
    // const pickupsQuery = `SELECT * FROM pickup`;
    // const doneQuery = `SELECT * FROM pickup WHERE user_id = ${userId} AND status = 'Done'`;
    const userPickupsQuery = `SELECT pickup.*, users.alamat FROM pickup JOIN users ON pickup.user_id = users.id WHERE user_id = ${userId} AND pickup.status = 'Done';`;
    const doneQuery = `SELECT pickup.*, users.alamat FROM pickup JOIN users ON pickup.user_id = users.id WHERE pickup.status = 'Done';`;
    const cancelledQuery = `SELECT pickup.*, users.alamat FROM pickup JOIN users ON pickup.user_id = users.id WHERE pickup.status = 'Cancelled';`;
    const pendingQuery = `SELECT pickup.*, users.alamat FROM pickup JOIN users ON pickup.user_id = users.id WHERE pickup.status = 'Pending';`;

    // db.query(pickupsQuery, (err, results) => {
    //   if (err) {
    //     console.error("Gagal mengambil data pickup:", err);
    //     return res.status(500).json({ error: "Gagal mengambil data pickup" });
    //   }

    //   pickups = results;
    // });

    db.query(userQuery, [userId], (err, results) => {
      if (err) {
        console.error("Gagal mengambil data user:", err);
        return res.status(500).json({ error: "Gagal mengambil data user" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "User tidak ditemukan" });
      }

      user = results[0];

      if (isAdmin) {
        db.query(doneQuery, (err, results) => {
          if (err) {
            console.error("Gagal mengambil data pickup:", err);
            return res
              .status(500)
              .json({ error: "Gagal mengambil data pickup" });
          }

          donePickup = results;
        });

        db.query(cancelledQuery, (err, results) => {
          if (err) {
            console.error("Gagal mengambil data pickup:", err);
            return res
              .status(500)
              .json({ error: "Gagal mengambil data pickup" });
          }

          cancelledPickup = results;
        });

        db.query(pendingQuery, (err, results) => {
          if (err) {
            console.error("Gagal mengambil data pickup:", err);
            return res
              .status(500)
              .json({ error: "Gagal mengambil data pickup" });
          }

          pendingPickup = results;
          res.render("dashboardAdmin", {
            user: user,
            donePickups: donePickup,
            cancelledPickups: cancelledPickup,
            pendingPickups: pendingPickup,
          });
        });
      } else {
        db.query(userPickupsQuery, (err, results) => {
          if (err) {
            console.error("Gagal mengambil data pickup:", err);
            return res
              .status(500)
              .json({ error: "Gagal mengambil data pickup" });
          }

          pickups = results;
          res.render("dashboard", {
            user: user,
            pickups: pickups,
          });
        });
      }
    });
  } catch (error) {
    console.error("JWT tidak valid:", error.message);
    return res.redirect("/signin");
  }
});

app.get("/dashboard/profile", (req, res) => {
  try {
    const token = req.cookies.auth_token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const isAdmin = decoded.is_admin;

    const userId = decoded.user_id;
    const query = "SELECT * FROM users WHERE id = ?";
    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error("Gagal mengambil data user:", err);
        return res.status(500).json({ error: "Gagal mengambil data user" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "User tidak ditemukan" });
      }

      res.render("user", { user: results[0] });
    });
  } catch (error) {
    console.error("JWT tidak valid:", error.message);
    return res.redirect("/signin");
  }
});

app.get("/dashboard/order", async (req, res) => {
  try {
    const token = req.cookies.auth_token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const isAdmin = decoded.is_admin;

    const userId = decoded.user_id;
    const userQuery = "SELECT * FROM users WHERE id = ?";
    const pickupsQuery = `SELECT pickup.*, users.name FROM pickup JOIN users ON pickup.user_id = users.id `;
    let users;
    let pickups;

    db.query(pickupsQuery, (err, results) => {
      if (err) {
        console.error("Gagal mengambil data user:", err);
        return res.status(500).json({ error: "Gagal mengambil data user" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "User tidak ditemukan" });
      }

      pickups = results;
    });
    db.query(userQuery, [userId], (err, results) => {
      if (err) {
        console.error("Gagal mengambil data user:", err);
        return res.status(500).json({ error: "Gagal mengambil data user" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "User tidak ditemukan" });
      }

      users = results;

      if (isAdmin) {
        res.render("dashboardAdmin2", { user: users[0], pickups: pickups });
      } else {
        res.redirect("/signin");
      }
    });
  } catch (error) {
    console.error("JWT tidak valid:", error.message);
    return res.redirect("/signin");
  }
});

app.get("/dashboard/map", (req, res) => {
  try {
    const token = req.cookies.auth_token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const isAdmin = decoded.is_admin;

    const userId = decoded.user_id;
    const query = "SELECT * FROM users WHERE id = ?";
    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error("Gagal mengambil data user:", err);
        return res.status(500).json({ error: "Gagal mengambil data user" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "User tidak ditemukan" });
      }

      if (isAdmin) {
        res.render("dashboardAdmin3", { user: results[0] });
      } else {
        res.redirect("/signin");
      }
    });
  } catch (error) {
    console.error("JWT tidak valid:", error.message);
    return res.redirect("/signin");
  }
});

app.get("/profile", (req, res) => {
  const token = req.cookies.auth_token;
  if (!token) {
    return res.status(401).json({ error: "Token tidak ditemukan" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error("JWT tidak valid:", err.message);
    return res.status(401).json({ error: "Token tidak valid" });
  }

  const userId = decoded.user_id; // pastikan token memang punya `user_id`
  const query = "SELECT * FROM users WHERE id = ?";

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Gagal mengambil data user:", err);
      return res.status(500).json({ error: "Gagal mengambil data user" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }

    res.json(results[0]); // kirimkan hanya satu user
  });
});

app.patch("/profile", (req, res) => {
  const token = req.cookies.auth_token;
  if (!token) {
    return res.status(401).json({ error: "Token tidak ditemukan" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error("JWT tidak valid:", err.message);
    return res.status(401).json({ error: "Token tidak valid" });
  }

  const userId = decoded.user_id;
  const allowedFields = ["name", "email", "password", "phone", "address"]; // ganti sesuai kolom yang boleh diubah

  const updates = [];
  const values = [];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(req.body[field]);
    }
  }

  if (updates.length === 0) {
    return res
      .status(400)
      .json({ error: "Tidak ada kolom yang diberikan untuk diupdate" });
  }

  values.push(userId); // untuk kondisi WHERE

  const query = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Gagal mengupdate data user:", err);
      return res.status(500).json({ error: "Gagal mengupdate data user" });
    }

    res.json({ message: "Data user berhasil diupdate" });
  });
});

app.post("/pickup", async (req, res) => {
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

app.patch("/pickup", async (req, res) => {
  const { status, pickup_id } = req.body;
  const token = req.cookies.auth_token;
  const query = "UPDATE pickup SET status = ? WHERE id = ?";
  if (!token) {
    return res.status(401).json({ error: "Token tidak ditemukan" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decoded.user_id;
  } catch (err) {
    console.error("JWT tidak valid:", err.message);
    return res.status(401).json({ error: "Token tidak valid" });
  }

  console.log(status);
  console.log(pickup_id);

  db.query(query, [status, pickup_id], (err, result) => {
    if (err) {
      console.error("Error updating status:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Pickup not found" });
    }

    res.json({ message: "Status updated successfully" });
  });
  // const json = JSON.stringify({
  //   data: {
  //     token: token,
  //     title: projectname,
  //     description: description,
  //   },
  //   method: "CREATE",
  // });
  // const projects = await axios.post(`${egeos_server}/api/gis/api.php`, json);
  // res.redirect("/pm");
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Example app listening on port http://localhost:3000");
});
