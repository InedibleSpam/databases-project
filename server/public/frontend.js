const departSelect = document.getElementById("depart");
const arriveSelect = document.getElementById("arrive");
const dateInput = document.getElementById("date");
const classSelect = document.getElementById("class");
const numTicketsInput = document.getElementById("numTickets");
const resultDiv = document.getElementById("result");
const searchBtn = document.getElementById("searchBtn");

// Load airports from backend
async function loadAirports() {
  try {
    const res = await fetch("/api/airports");
    if (!res.ok) throw new Error("Failed to fetch airports");
    const airports = await res.json();

    departSelect.length = 1;
    arriveSelect.length = 1;

    airports.forEach(a => {
      const optionDepart = document.createElement("option");
      optionDepart.value = a.air_id;
      optionDepart.textContent = `${a.city}, ${a.state}`;
      departSelect.appendChild(optionDepart);

      const optionArrive = document.createElement("option");
      optionArrive.value = a.air_id;
      optionArrive.textContent = `${a.city}, ${a.state}`;
      arriveSelect.appendChild(optionArrive);
    });
  } catch (err) {
    console.error(err);
    resultDiv.textContent = "Error loading airports. Check backend API.";
  }
}

// Search flight and get price
async function searchFlight() {

  if (!localStorage.getItem("userId")) {
    resultDiv.textContent = "Please log in first.";
    return;
  }

  const depart_port = departSelect.value;
  const arrive_port = arriveSelect.value;
  const depart_date = dateInput.value;
  const seat_class = classSelect.value;
  const num_tickets = numTicketsInput.value;

  if (!depart_port || !arrive_port || !depart_date) {
    resultDiv.textContent = "Please select departure, arrival, and date.";
    return;
  }

  try {
    const url = `/api/calculate_price?depart_port=${depart_port}&arrive_port=${arrive_port}&depart_date=${depart_date}&seat_class=${seat_class}&num_tickets=${num_tickets}`;
    const res = await fetch(url);
    const data = await res.json();

    if (res.ok) {
      resultDiv.textContent = `Price for ${num_tickets} ticket(s): $${data.price}`;
    } else {
      resultDiv.textContent = data.message || "No flight found.";
    }
  } catch (err) {
    console.error(err);
    resultDiv.textContent = "Error searching flight. Check backend.";
  }
}

searchBtn.addEventListener("click", searchFlight);

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("userId");
  alert("Logged out successfully.");
  location.reload();
});

window.addEventListener("load", loadAirports);

