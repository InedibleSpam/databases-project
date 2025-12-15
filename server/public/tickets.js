document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const user_id = params.get('user_id');
    const ticketsListDiv = document.getElementById('ticketsList');
    const messageElement = document.getElementById('ticketMessage');

    if (!user_id) {
        messageElement.textContent = "Error: User ID not found. Please log in or return from the purchase page.";
        messageElement.style.color = 'red';
        return;
    }

    // Function to render the tickets
    function renderTickets(flights) {
        ticketsListDiv.innerHTML = '';

        if (flights.length === 0) {
            messageElement.textContent = "No tickets found for this user.";
            messageElement.style.color = 'orange';
            return;
        }

        messageElement.textContent = `Displaying ${flights.length} unique flight(s) purchased by your account.`;
        messageElement.style.color = 'green';


        flights.forEach(flight => {
            const flightGroup = document.createElement('div');
            flightGroup.className = 'flight-group';

            const header = document.createElement('div');
            header.className = 'flight-header';
            header.innerHTML = `
                <div class="location-info">${flight.depart_location} (${flight.departure_time}) to ${flight.arrive_location} (${flight.arrival_time})</div>
                <div>Date: ${flight.date}</div>
            `;
            flightGroup.appendChild(header);

            flight.passengers.forEach(p => {
                const ticketCard = document.createElement('div');
                ticketCard.className = 'ticket-card';
                ticketCard.innerHTML = `
                    <div><strong>Passenger:</strong> ${p.name}</div>
                    <div><strong>Class:</strong> ${p.seat_class}</div>
                    <div><strong>Price:</strong> $${p.price.toFixed(2)}</div>
                    <div><strong>Ticket ID:</strong> ${p.ticket_id}</div>
                    <div><strong>Carry-on:</strong> ${p.carryon}</div>
                `;
                flightGroup.appendChild(ticketCard);
            });

            ticketsListDiv.appendChild(flightGroup);
        });
    }

    // Fetch tickets from the backend
    async function fetchTickets() {
        try {
            const response = await fetch(`/api/get_user_tickets?user_id=${user_id}`);
            const data = await response.json();

            if (response.ok) {
                renderTickets(data.tickets);
            } else {
                messageElement.textContent = `Failed to load tickets: ${data.message || 'Server error'}`;
                messageElement.style.color = 'red';
            }
        } catch (error) {
            console.error("Error fetching tickets:", error);
            messageElement.textContent = "Network error: Could not connect to the server to retrieve tickets.";
            messageElement.style.color = 'red';
        }
    }

    fetchTickets();
});