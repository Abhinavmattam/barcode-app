const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'abhinav 12',  // your root password here
    database: 'barcode_app'
});

connection.connect(err => {
    if (err) {
        console.error('❌ Database connection error:', err);
        return;
    }
    console.log('✅ Connected to MySQL Database');
});

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

app.listen(3002, () => {
    console.log('🚀 API running at http://localhost:3002');
});
