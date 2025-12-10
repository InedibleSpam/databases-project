const db = require("./db");

// User Authentication

async function register_user(name, email, password) {
  await db.query(
    "INSERT INTO user (fname, lname, user_email, user_password) VALUES (?, ?, ?, ?)",
    [name, "Unknown", email, password]
  );
}

async function authenticate_user(email, password) {
  const [rows] = await db.query(
    "SELECT * FROM user WHERE user_email = ? AND user_password = ?",
    [email, password]
  );
  return rows[0] || null;
}

// Get Airports

async function get_airports() {
  const [rows] = await db.query("SELECT * FROM airport");
  return rows;
}

// Flight Search Functions

// Find flight by departure, arrival, and date
async function find_flight(depart_port, arrive_port, flightDate) {
  const [rows] = await db.query(
    "SELECT l.log_id, l.plane_id FROM logs l JOIN plane p ON l.plane_id = p.plane_id WHERE p.outgoing = ? AND p.incoming = ? AND l.flightDate = ?",
    [depart_port, arrive_port, flightDate]
  );
  return rows[0] || null;
}

// Calculate price based on class and number of tickets
async function calculate_price(plane_id, seat_class, num_tickets) {
  let basePrice = 200;

  if (seat_class.toLowerCase() === "business") basePrice *= 1.5;
  else if (seat_class.toLowerCase() === "first") basePrice *= 2;

  return { total_price: basePrice * num_tickets };
}

// Buy Ticket

async function buy_tick(email, password, price, seat_class, depart_port, arrive_port, date, num_ticks, carry_on) {
  // Authenticate
  const user = await authenticate_user(email, password);
  if (!user) throw new Error("Invalid email/password");

  // Find flight
  const flight = await find_flight(depart_port, arrive_port, date);
  if (!flight) throw new Error("Flight not found");

  // Insert passenger
  const [passResult] = await db.query(
    "INSERT INTO passenger (user_id, carryon) VALUES (?, ?)",
    [user.user_id, carry_on ? 1 : 0]
  );

  const pass_id = passResult.insertId;

  // Insert ticket(s)
  for (let i = 0; i < num_ticks; i++) {
    await db.query(
      "INSERT INTO ticket (pass_id, price, class, airport, num_tickets) VALUES (?, ?, ?, ?, ?)",
      [pass_id, price, seat_class, depart_port, 1]
    );
  }

  // Insert payment record
  await db.query(
    "INSERT INTO payment (user_id, Tick_Price, Date, Type) VALUES (?, ?, ?, ?)",
    [user.user_id, price * num_ticks, date, seat_class]
  );

  return { message: `Successfully bought ${num_ticks} ticket(s)` };
}

module.exports = {
  register_user,
  authenticate_user,
  get_airports,
  find_flight,
  calculate_price,
  buy_tick
};
