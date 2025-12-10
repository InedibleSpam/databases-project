const express = require("express");
const router = express.Router();
const funcs = require("./functions");

// Page Routes
router.get("/", (req, res) => res.sendFile("frontend.html", { root: "public" }));
router.get("/login", (req, res) => res.sendFile("login.html", { root: "public" }));
router.get("/signup", (req, res) => res.sendFile("signup.html", { root: "public" }));

// API Routes

// Registration
router.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    await funcs.register_user(name, email, password);
    res.status(201).json({ message: "Registration successful. Please log in." });
  } catch (err) {
    res.status(500).json({ message: "Registration failed.", error: err.message });
  }
});

// Login
router.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await funcs.authenticate_user(email, password);
    if (user) res.json({ message: "Login successful.", user });
    else res.status(401).json({ message: "Invalid email or password." });
  } catch (err) {
    res.status(500).json({ message: "Login failed.", error: err.message });
  }
});

// Get all airports
router.get("/api/airports", async (req, res) => {
  try {
    const data = await funcs.get_airports();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Calculate price
router.get("/api/calculate_price", async (req, res) => {
  const { depart_port, arrive_port, depart_date, seat_class, num_tickets } = req.query;

  if (!depart_port || !arrive_port || !depart_date || !seat_class || !num_tickets) {
    return res.status(400).json({ message: "Missing query parameters." });
  }

  try {
    // Find flight by departure, arrival, and date
    const flight = await funcs.find_flight(depart_port, arrive_port, depart_date);

    if (!flight) {
      return res.status(404).json({ message: "No flight found for the selected route and date." });
    }

    // Calculate price based on class and number of tickets
    const priceResult = await funcs.calculate_price(flight.plane_id, seat_class, parseInt(num_tickets));

    res.json({
      flight_id: flight.log_id,
      price: priceResult.total_price
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Buy ticket
router.post("/api/buy_ticket", async (req, res) => {
  try {
    const {
      use_email, user_password, tic_price, seat_class, depart_port,
      arrive_port, depart_date, num_ticks, carry_on
    } = req.body;

    const result = await funcs.buy_tick(
      use_email, user_password, tic_price, seat_class,
      depart_port, arrive_port, depart_date, num_ticks, carry_on
    );

    res.json({ message: result.message });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
