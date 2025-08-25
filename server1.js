const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(bodyParser.json());

// Serve static files (CSS/JS/images) from the current folder
app.use(express.static(__dirname));

// MySQL connection (Railway details)
const db = mysql.createConnection({
  host: process.env.MYSQLHOST || "centerbeam.proxy.rlwy.net", // Railway host
  user: process.env.MYSQLUSER || "root",                      // Railway user
  password: process.env.MYSQLPASSWORD || "DoiHJGqGlkTSeoiUsHnAyLLUiSrJUeJD",// Railway password
  database: process.env.MYSQLDATABASE || "railway",           // Railway DB name
  port: process.env.MYSQLPORT || 26628                        // Railway port
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed: " + err.stack);
    return;
  }
  console.log("✅ Connected to Railway MySQL database!");
});

// Serve index.html on root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// API: fetch all users
app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// API: insert user
app.post("/users", (req, res) => {
  const { name, email } = req.body;
  db.query(
    "INSERT INTO users (name, email) VALUES (?, ?)",
    [name, email],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "User added successfully!", id: result.insertId });
    }
  );
});

// API: get product by barcode
app.get("/get-product", (req, res) => {
  const barcode = req.query.barcode;

  if (!barcode) {
    return res.json({ product_name: null, mrp: null });
  }

  const query = "SELECT product_name, mrp FROM products WHERE TRIM(barcode) = TRIM(?)";
  db.query(query, [barcode], (err, results) => {
    if (err) return res.status(500).json({ error: err });

    if (results.length > 0) {
      res.json({
        product_name: results[0].product_name,
        mrp: results[0].mrp
      });
    } else {
      res.json({ product_name: null, mrp: null });
    }
  });
});

// Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
