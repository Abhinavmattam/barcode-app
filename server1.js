const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(bodyParser.json());

// Serve static files (CSS/JS/images) from the current folder
app.use(express.static(__dirname));

// MySQL connection
const db = mysql.createConnection({
  host: process.env.MYSQLHOST || "localhost",
  user: process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || "abhinav 12",
  database: process.env.MYSQLDATABASE || "barcode_app",
  port: process.env.MYSQLPORT || 3306,
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed: " + err.stack);
    return;
  }
  console.log("✅ Connected to MySQL database!");
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

  const query = "SELECT product_name, mrp FROM products WHERE barcode = ?";
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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
