const express = require("express");
const router = express.Router();
const funcs = require("./functions");

// Helper function to calculate remaining seats
function calculateRemainingSeatsFromFlight(flight, seat_class) {
  const requestedClass = seat_class.toLowerCase();
  let totalSeats;

  if (requestedClass === "first") {
    totalSeats = flight.First_class_seat;
  } else if (requestedClass === "business") {
    totalSeats = flight.Buisness_class_seat;
  } else {
    // economy
    totalSeats = flight.Economy_class_seat;
  }
  const ticketsSoldPlaceholder = 5;

  return Math.max(0, totalSeats - ticketsSoldPlaceholder);
}

// Page Routes 
router.get("/", (req, res) =>
  res.sendFile("frontend.html", { root: "public" })
);
router.get("/login", (req, res) =>
  res.sendFile("login.html", { root: "public" })
);
router.get("/signup", (req, res) =>
  res.sendFile("signup.html", { root: "public" })
);
router.get("/purchase", (req, res) =>
  res.sendFile("purchase.html", { root: "public" })
);
router.get("/tickets", (req, res) =>
  res.sendFile("tickets.html", { root: "public" })
);

// User Registration Route
router.post("/api/register", async (req, res) => {
    try {
        const { fname, lname, email, password, birthdate } = req.body;
        await funcs.register_user(fname, lname, email, password, birthdate);
        res.status(201).json({ message: "User registered successfully." });
    } catch (err) {
        res.status(500).json({ message: "Registration failed.", error: err.message });
    }
});

// User Login Route
router.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await funcs.authenticate_user(email, password);
        if (user) {
            res.json({ message: "Login successful.", user });
        } else {
            res.status(401).json({ message: "Invalid email or password." });
        }
    } catch (err) {
        res.status(500).json({ message: "Login failed.", error: err.message });
    }
});

// Airports Retrieval Route
router.get("/api/airports", async (req, res) => {
    try {
        const airports = await funcs.get_airports();
        res.json({ airports });
    } catch (err) {
        res.status(500).json({ message: "Failed to retrieve airports.", error: err.message });
    }
});

// Calculate Price Route
router.get("/api/calculate_price", async (req, res) => {
    try {
        const { plane_id, seat_class, num_tickets } = req.query;
        if (!plane_id || !seat_class || !num_tickets) {
            return res.status(400).json({ message: "Missing required price parameters." });
        }

        const price = await funcs.calculate_price(plane_id, seat_class, parseInt(num_tickets));
        res.json(price);
    } catch (err) {
        res.status(500).json({ message: "Price calculation failed.", error: err.message });
    }
});

// Sorted Flight Search Route
router.get("/api/search_flights_sorted", async (req, res) => {
  try {
    const {
      depart_port,
      arrive_port,
      date: depart_date,
      seat_class,
      num_tickets,
      sort_by = "Depature_time",
      sort_order = "ASC",
    } = req.query;

    if (
      !depart_port ||
      !arrive_port ||
      !depart_date ||
      !seat_class ||
      !num_tickets
    ) {
      return res
        .status(400)
        .json({ message: "Missing required flight parameters." });
    }

    const filters = { seat_class };

    const raw_flights = await funcs.GeneralSortFunction(
      depart_port,
      arrive_port,
      depart_date,
      filters,
      sort_by,
      sort_order
    );

    if (raw_flights.length === 0) {
      return res.json({ flights: [] });
    }

    const flights_with_details = raw_flights.map((flight) => {
      const total_price = flight.price * parseInt(num_tickets);
      const remaining_seats = calculateRemainingSeatsFromFlight(
        flight,
        seat_class
      );

      return {
        log_id: flight.log_id,
        departure_time: flight.Depature_time,
        arrival_time: flight.Arrival_time,
        price: total_price,
        remaining_seats: remaining_seats,
        depart_city_state: `${flight.depart_city}, ${flight.depart_state}`,
        arrive_city_state: `${flight.arrive_city}, ${flight.arrive_state}`,
        depart_port: flight.out_airport,
        arrive_port: flight.in_airport,
        unit_price: flight.price,
      };
    });

    res.json({ flights: flights_with_details });
  } catch (err) {
    console.error("Error in /api/search_flights_sorted:", err);
    res
      .status(500)
      .json({
        message: "Failed to perform flight search.",
        error: err.message,
      });
  }
});

// Buy Ticket Route
router.post("/api/buy_ticket", async (req, res) => {
  try {
    const {
      use_email,
      user_password,
      unit_price,
      seat_class,
      depart_date,
      passenger_names,
      carry_on,
      log_id,
      payment_type,
    } = req.body;

    if (!Array.isArray(passenger_names) || passenger_names.length === 0) {
      return res
        .status(400)
        .json({
          message:
            "Missing or invalid list of passenger names. At least one required.",
        });
    }

    const result = await funcs.buy_tick(
      use_email,
      user_password,
      unit_price,
      seat_class,
      depart_date,
      passenger_names,
      carry_on,
      log_id,
      payment_type
    );

    res.json({
      message: result.message,
      user_id: result.user_id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Tickets by User ID
router.get("/api/get_user_tickets", async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const tickets = await funcs.get_user_tickets(user_id);
    res.json({ tickets });
  } catch (err) {
    console.error("Error fetching tickets:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch tickets.", error: err.message });
  }
});

module.exports = router;
