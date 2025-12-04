const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "mydb"
});

db.connect(err => {
    if (err) throw err;
    console.log("MySQL Connected!");
});

// register
app.post("/register", (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
        return res.status(400).json({ message: "Missing fields" });

    const checkEmail = "SELECT * FROM passenger WHERE pass_email = ?";
    db.query(checkEmail, [email], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });

        if (results.length > 0) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const insertUser =
            "INSERT INTO passenger(pass_name, pass_email, password) VALUES (?, ?, ?)";

        db.query(insertUser, [name, email, password], (err) => {
            if (err) return res.status(500).json({ message: "DB insert error" });

            res.json({ message: "User registered successfully" });
        });
    });
});

// login
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ message: "Missing email or password" });

    const loginQuery =
        "SELECT * FROM passenger WHERE pass_email = ? AND password = ?";

    db.query(loginQuery, [email, password], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });

        if (results.length === 0)
            return res.status(401).json({ message: "Invalid login" });

        res.json({
            message: "Login successful",
            name: results[0].pass_name
        });
    });
});

// Home route
app.get("/", (req, res) => {
    res.send("Server is running!");
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
