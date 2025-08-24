const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MySQL connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});

connection.connect(err => {
    if (err) {
        console.error('❌ Database connection error:', err);
        return;
    }
    console.log('✅ Connected to MySQL Database');
});

// ✅ Root route (for Render health check + browser test)
app.get('/', (req, res) => {
    res.send('✅ BC Scanner backend is running successfully!');
});

// ✅ API: Get product details by barcode
app.get('/get-product', (req, res) => {
    const barcode = req.query.barcode;

    if (!barcode) {
        return res.json({ product_name: null, mrp: null });
    }

    const query = 'SELECT product_name, mrp FROM products WHERE barcode = ?';
    connection.query(query, [barcode], (err, results) => {
        if (err) {
            console.error('❌ Query error:', err);
            return res.status(500).send('Error querying database');
        }

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

// ✅ Server listen
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`🚀 API running at http://localhost:${PORT}`);
});