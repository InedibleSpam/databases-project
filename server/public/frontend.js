const departSelect = document.getElementById("depart");
const arriveSelect = document.getElementById("arrive");
const dateInput = document.getElementById("date");
const classSelect = document.getElementById("class");
const numTicketsInput = document.getElementById("numTickets");
const resultDiv = document.getElementById("result");
const searchBtn = document.getElementById("searchBtn");

let currentSortBy = "Depature_time";
let currentSortOrder = "ASC";

// Load airports from backend 
async function loadAirports() {
  try {
    const res = await fetch("/api/airports");
    if (!res.ok) throw new Error("Failed to fetch airports");
    const airports = await res.json();

    departSelect.length = 1;
    arriveSelect.length = 1;

    airports.forEach((a) => {
      const optionDepart = document.createElement("option");
      optionDepart.value = a.Air_id;
      optionDepart.textContent = `${a.City}, ${a.State}`;
      departSelect.appendChild(optionDepart);
      const optionArrive = document.createElement("option");
      optionArrive.value = a.Air_id;
      optionArrive.textContent = `${a.City}, ${a.State}`;
      arriveSelect.appendChild(optionArrive);
    });
  } catch (err) {
    console.error(err);
    resultDiv.textContent = "Error loading airports. Check backend API.";
  }
}

// Render flight cards
function renderFlightCards(flights, seat_class, num_tickets) {
  let html = `<h2>Available ${seat_class} Flights (${num_tickets} Tickets)</h2>`;

  html += `
        <div id="sortControls" style="text-align: center; margin-bottom: 20px;">
            <p style="font-weight: bold; margin-bottom: 5px; color: #555;">Sort Results By:</p>
            <button onclick="executeFlightSearch('Depature_time', 'ASC')" class="sort-btn">Departure Time</button>
            <button onclick="executeFlightSearch('price', 'ASC')" class="sort-btn">Price Low to High</button>
            <button onclick="executeFlightSearch('price', 'DESC')" class="sort-btn">Price High to Low</button>
        </div>
        <div class="flight-cards-container">`;

  flights.forEach((flight) => {
    const seatsStyle =
      flight.remaining_seats < 10 ? "color: red; font-weight: bold;" : "";

    html += `
            <div class="flight-card">
                <div class="flight-info">
                    <span class="flight-detail-label">Route:</span> 
                    <span class="flight-detail-value">${
                      flight.depart_city_state
                    } &rarr; ${flight.arrive_city_state}</span>
                </div>
                <div class="flight-info">
                    <span class="flight-detail-label">Departure Time:</span> 
                    <span class="flight-detail-value">${
                      flight.departure_time
                    }</span>
                </div>
                <div class="flight-info">
                    <span class="flight-detail-label">Arrival Time:</span> 
                    <span class="flight-detail-value">${
                      flight.arrival_time
                    }</span>
                </div>
                <div class="flight-price">
                    <span class="flight-detail-label">Total Price:</span>
                    <span class="price-value">$${flight.price.toFixed(2)}</span>
                </div>
                <div class="flight-seats">
                    <span class="flight-detail-label">Seats Left:</span>
                    <span class="seats-value" style="${seatsStyle}">${
      flight.remaining_seats
    }</span>
                </div>
                <div class="flight-action">
                    <button onclick="bookFlight('${flight.log_id}', '${
      flight.price
    }', '${seat_class}', '${num_tickets}', '${flight.depart_port}', '${
      flight.arrive_port
    }')">Buy Ticket</button>
                </div>
            </div>
        `;
  });

  html += `</div>`;
  resultDiv.innerHTML = html;
}

// Handle flight search with sorting
async function executeFlightSearch(
  sortBy = currentSortBy,
  sortOrder = currentSortOrder
) {
  if (!localStorage.getItem("userId")) {
    resultDiv.innerHTML = "Please log in first.";
    return;
  }

  const depart_port = departSelect.value;
  const arrive_port = arriveSelect.value;
  const depart_date = dateInput.value;
  const seat_class = classSelect.value;
  const num_tickets = numTicketsInput.value;

  if (!depart_port || !arrive_port || !depart_date) {
    resultDiv.innerHTML = "Please select departure, arrival, and date.";
    return;
  }

  if (depart_port === arrive_port) {
    resultDiv.innerHTML = "Departure and arrival airports cannot be the same.";
    return;
  }

  currentSortBy = sortBy;
  currentSortOrder = sortOrder;

  resultDiv.innerHTML = "Searching for flights...";

  try {
    const url = `/api/search_flights_sorted?depart_port=${depart_port}&arrive_port=${arrive_port}&date=${depart_date}&seat_class=${seat_class}&num_tickets=${num_tickets}&sort_by=${sortBy}&sort_order=${sortOrder}`;

    const res = await fetch(url);
    const data = await res.json();

    if (res.ok && data.flights && data.flights.length > 0) {
      renderFlightCards(data.flights, seat_class, num_tickets);
    } else if (res.ok && data.flights && data.flights.length === 0) {
      resultDiv.innerHTML = `<p style="color: black;">No ${seat_class} flights found for this route and date.</p>`;
    } else {
      resultDiv.innerHTML = `<p style="color: ${
        data.message ? "red" : "black"
      };">${
        data.message || "An error occurred while searching for flights."
      }</p>`;
    }
  } catch (err) {
    console.error(err);
    resultDiv.innerHTML =
      "Error searching flight. Check network and backend connection.";
  }
}

// Handle booking flight
function bookFlight(
  log_id,
  price,
  seat_class,
  num_tickets,
  depart_port,
  arrive_port
) {
  const depart_date = dateInput.value;
  const confirmMessage = `Are you sure you wish to purchase ${num_tickets} ticket(s) for the flight on ${depart_date} for a total price of $${parseFloat(
    price
  ).toFixed(2)}?`;

  if (confirm(confirmMessage)) {
    const query = new URLSearchParams({
      log_id: log_id,
      price: price,
      class: seat_class,
      tickets: num_tickets,
      depart_port: depart_port,
      arrive_port: arrive_port,
      date: depart_date,
    }).toString();

    window.location.href = `/purchase.html?${query}`;
  }
}

// Event Listeners
searchBtn.addEventListener("click", () =>
  executeFlightSearch("Depature_time", "ASC")
);

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("userId");
  alert("Logged out successfully.");
  location.reload();
});

window.addEventListener("load", loadAirports);
