const db = require("./db");

//Returns number 
function setPriceGreaterThan(price_greater_than){
    return price_greater_than;
}
//Returns number 
function setPriceLessThan(price_less_than){
    return price_less_than;
}
//Returns string 
function setSeatClass(seat_class){
    return seat_class;
}   

// User Authentication 
async function register_user(fname, lname, email, password, birthdate) {
    await db.query(
        "INSERT INTO user (fname, lname, user_email, user_password, birthday) VALUES (?, ?, ?, ?, ?)",
        [fname, lname, email, password, birthdate]
    );
}

// Authenticate User
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
async function find_flights(depart_port, arrive_port, flightDate) {
    const [rows] = await db.query(
        `SELECT 
            l.log_id, 
            l.plane_id,
            l.Depature_time, 
            l.Arrival_time,
            p.First_class_seat,
            p.Buisness_class_seat,
            p.Economy_class_seat
        FROM logs l 
        JOIN plane p ON l.Plane_id = p.Plane_id 
        WHERE 
            l.out_airport = ? 
            AND l.in_airport = ? 
            AND l.Date = ?
        ORDER BY l.Depature_time ASC`,
        [depart_port, arrive_port, flightDate]
    );
    return rows;
}

// Sorting and Filtering Function 
async function GeneralSortFunction(depart_port, arrive_port, flightDate, filters = {}, sortBy = 'Depature_time', sortOrder = 'ASC') {
    
    let sql = `
        SELECT DISTINCT
            t.price, 
            t.class, 
            l.log_id,
            l.plane_id,
            l.Depature_time, 
            l.Arrival_time,
            l.out_airport,
            l.in_airport,
            A_dep.City AS depart_city,
            A_dep.State AS depart_state,
            A_arr.City AS arrive_city,
            A_arr.State AS arrive_state,
            p.First_class_seat,
            p.Buisness_class_seat,
            p.Economy_class_seat
        FROM logs l 
        JOIN ticket t ON l.log_id = t.log_id
        JOIN plane p ON l.Plane_id = p.Plane_id
        JOIN airport A_dep ON l.out_airport = A_dep.Air_id
        JOIN airport A_arr ON l.in_airport = A_arr.Air_id
        WHERE 
            l.out_airport = ? 
            AND l.in_airport = ? 
            AND l.Date = ?
    `;
    
    const sql_values = [depart_port, arrive_port, flightDate];
    if (filters.seat_class) {
        sql += " AND t.class = ?";
        sql_values.push(filters.seat_class);
    }
    
    let sortField = 'l.Depature_time'; 
    if (sortBy === 'price') {
        sortField = 't.price';
    } else if (sortBy === 'Depature_time') {
        sortField = 'l.Depature_time';
    } else if (sortBy === 'Arrival_time') {
        sortField = 'l.Arrival_time';
    }

    const order = (sortOrder.toUpperCase() === 'DESC') ? 'DESC' : 'ASC';
    
    sql += ` ORDER BY ${sortField} ${order}`;

    const [flights] = await db.query(sql, sql_values);
    return flights;
}

// Calculate price based on class and number of tickets 
async function calculate_price(plane_id, seat_class, num_tickets) {
    let basePrice = 200;

    if (seat_class.toLowerCase() === "business") basePrice *= 1.5;
    else if (seat_class.toLowerCase() === "first") basePrice *= 2;

    return { total_price: basePrice * num_tickets };
}

// Purchase Tickets
async function buy_tick(
    email,
    password,
    base_price,
    seat_class,
    date,
    passenger_names, 
    carry_on,
    log_id,
    payment_type
) {
    const user = await authenticate_user(email, password);
    if (!user) throw new Error("Invalid email/password");
    
    const [logDetails] = await db.query(
        "SELECT out_airport FROM logs WHERE Log_id = ?", 
        [log_id]
    );
    if (logDetails.length === 0) throw new Error("Flight details not found.");
    
    const { out_airport: Airport_id } = logDetails[0]; 

    const num_ticks = passenger_names.length;
    for (const passenger of passenger_names) {
                const [ticketResult] = await db.query(
            `INSERT INTO ticket 
             (price, class, Airport, log_id) 
             VALUES (?, ?, ?, ?)`,
            [base_price, seat_class, Airport_id, log_id]
        );
        const tick_id = ticketResult.insertId;
        await db.query(
            `INSERT INTO passenger 
             (user_id, carryon, fname, lname, ticket_id) 
             VALUES (?, ?, ?, ?, ?)`,
            [user.user_id, carry_on ? 1 : 0, passenger.fname, passenger.lname, tick_id]
        );
    }
    const total_price = base_price * num_ticks;
    await db.query(
        "INSERT INTO payment (user_id, Tick_Price, Date, Type) VALUES (?, ?, ?, ?)",
        [user.user_id, total_price, date, payment_type]
    );
    return { 
        message: `Successfully bought ${num_ticks} ticket(s) for ${num_ticks} passengers.`,
        user_id: user.user_id 
    };
}

// Retrieve tickets by user ID 
async function get_user_tickets(user_id) {
    const [rows] = await db.query(
        `SELECT 
            p.pass_id,
            p.fname AS passenger_fname,
            p.lname AS passenger_lname,
            p.carryon,
            t.price AS ticket_price,
            t.class AS seat_class,
            t.tick_id,
            l.Date,
            l.Depature_time,
            l.Arrival_time,
            A_out.City AS depart_city,
            A_out.State AS depart_state,
            A_in.City AS arrive_city,
            A_in.State AS arrive_state
        FROM passenger p
        JOIN ticket t ON p.ticket_id = t.tick_id
        JOIN logs l ON t.log_id = l.Log_id
        JOIN airport A_out ON l.out_airport = A_out.Air_id
        JOIN airport A_in ON l.in_airport = A_in.Air_id
        WHERE p.user_id = ?
        ORDER BY l.Date DESC, l.Depature_time DESC`,
        [user_id]
    );
    
    // Group tickets by flight 
    const tickets = {};
    rows.forEach(row => {
        const flightKey = `${row.Date}-${row.Depature_time}-${row.arrive_city}`;
        if (!tickets[flightKey]) {
            tickets[flightKey] = {
                date: row.Date,
                departure_time: row.Depature_time,
                arrival_time: row.Arrival_time,
                depart_location: `${row.depart_city}, ${row.depart_state}`,
                arrive_location: `${row.arrive_city}, ${row.arrive_state}`,
                passengers: []
            };
        }
        tickets[flightKey].passengers.push({
            name: `${row.passenger_fname} ${row.passenger_lname}`,
            ticket_id: row.tick_id,
            seat_class: row.seat_class,
            price: row.ticket_price,
            carryon: row.carryon === 1 ? 'Yes' : 'No'
        });
    });

    return Object.values(tickets);
}


module.exports = {
    register_user,
    authenticate_user,
    get_airports,
    find_flights,
    calculate_price,
    buy_tick,
    GeneralSortFunction,
    get_user_tickets
};