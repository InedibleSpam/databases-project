document.addEventListener('DOMContentLoaded', () => {
    const flightDetailsDiv = document.getElementById('flightDetails');
    const purchaseForm = document.getElementById('purchaseForm');
    const messageElement = document.getElementById('purchaseMessage');
    const passengerInputsContainer = document.getElementById('passengerInputsContainer');
    const numTicketsDisplay = document.getElementById('numTicketsDisplay');

    const emailInput = document.getElementById('userEmail');
    const passwordInput = document.getElementById('userPassword');
    const carryOnSelect = document.getElementById('carryOn');
    const paymentTypeSelect = document.getElementById('paymentType');

    const params = new URLSearchParams(window.location.search);
    const log_id = params.get('log_id');
    const seat_class = params.get('class');
    const num_tickets = parseInt(params.get('tickets'));
    const depart_port = params.get('depart_port');
    const arrive_port = params.get('arrive_port');
    const date = params.get('date');

    const unit_price = parseFloat(params.get('price')); 
    const total_price = unit_price * num_tickets; // Correctly calculate total price
    
    if (!log_id || isNaN(unit_price) || isNaN(num_tickets) || !depart_port || !arrive_port || !date) {
        flightDetailsDiv.innerHTML = '<p style="color: red;">Error: Missing flight details. Please return to the search page.</p>';
        purchaseForm.style.display = 'none';
        return;
    }
    
    flightDetailsDiv.innerHTML = `
        <p><strong>Flight Log ID:</strong> ${log_id}</p>
        <p><strong>Route:</strong> ${depart_port} to ${arrive_port}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Class:</strong> ${seat_class}</p>
        <p><strong>Tickets:</strong> ${num_tickets}</p>
        <p><strong>Price per Ticket:</strong> $${unit_price.toFixed(2)}</p>
        <p><strong>Total Price:</strong> <span style="font-size: 1.2em; color: green;">$${total_price.toFixed(2)}</span></p>
    `;

    numTicketsDisplay.textContent = num_tickets;


    // Passenger Input Fields
    function generatePassengerInputs() {
        passengerInputsContainer.innerHTML = '';
        for (let i = 0; i < num_tickets; i++) {
            const passengerDiv = document.createElement('div');
            passengerDiv.className = 'passenger-input-container';
            
            const fnameId = `fname${i}`;
            const lnameId = `lname${i}`;
            
            passengerDiv.innerHTML = `
                <div class="passenger-row">
                    <h3>Passenger ${i + 1}</h3>
                    <div class="form-group">
                        <label for="${fnameId}">First Name</label>
                        <input type="text" id="${fnameId}" class="passenger-fname" required>
                    </div>
                    <div class="form-group">
                        <label for="${lnameId}">Last Name</label>
                        <input type="text" id="${lnameId}" class="passenger-lname" required>
                    </div>
                </div>
            `;
            passengerInputsContainer.appendChild(passengerDiv);
        }
    }
    generatePassengerInputs();


    // Handle Purchase Submission
    purchaseForm.addEventListener('submit', handlePurchase);

    async function handlePurchase(event) {
        event.preventDefault();


        const email = emailInput.value;
        const password = passwordInput.value;
        const carryon = carryOnSelect.value === '1'; 
        const payment_type = paymentTypeSelect.value;
        
        const passenger_names = [];
        for (let i = 0; i < num_tickets; i++) {
            const fnameInput = document.getElementById(`fname${i}`);
            const lnameInput = document.getElementById(`lname${i}`);

            if (!fnameInput.value || !lnameInput.value) {
                messageElement.style.color = 'red';
                messageElement.textContent = `Error: Please enter the full name for Passenger ${i + 1}.`;
                return;
            }

            passenger_names.push({
                fname: fnameInput.value,
                lname: lnameInput.value,
            });
        }
        
        messageElement.textContent = 'Processing purchase...';
        messageElement.style.color = 'blue';

        const purchaseData = {
            use_email: email,
            user_password: password,
            unit_price: unit_price, 
            seat_class: seat_class,
            depart_date: date,
            passenger_names: passenger_names,
            carry_on: carryon,
            log_id: log_id,
            payment_type: payment_type
        };

        try {
            const res = await fetch('/api/buy_ticket', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(purchaseData)
            });

            const data = await res.json();

            if (res.ok) {
                if (data.user_id) {
                    messageElement.style.color = 'green';
                    messageElement.textContent = 'Purchase successful! Redirecting to your tickets...';
                    setTimeout(() => {
                        window.location.href = `/tickets?user_id=${data.user_id}`;
                    }, 1500);
                } else {
                    messageElement.style.color = 'green';
                    messageElement.textContent = data.message || 'Purchase successful! Please manually check your account.';
                }
                
            } else {
                messageElement.style.color = 'red';
                messageElement.textContent = `Purchase Failed: ${data.message || 'Server error occurred.'}`;
            }

        } catch (error) {
            console.error('Network Error:', error);
            messageElement.style.color = 'red';
            messageElement.textContent = 'A network error occurred. Please try again.';
        }
    }
});