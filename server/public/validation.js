const form = document.getElementById("form");
const nameField = document.getElementById("name"); 
const email = document.getElementById("email");
const password = document.getElementById("password");
const password2 = document.getElementById("password2"); 
const errorMessage = document.getElementById("error-message");

// submit handling
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    let errors = [];

    const isSignupPage = nameField !== null; // true only on signup.html

    if (isSignupPage) {
        errors = getSignupFormErrors(nameField, email, password, password2);
    } else {
        errors = getLoginFormErrors(email, password);
    }

    if (errors.length > 0) {
        errorMessage.innerText = errors.join(", ");
        return;
    }

    // signup
    if (isSignupPage) {
        try {
            const res = await fetch("/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: nameField.value,
                    email: email.value,
                    password: password.value
                })
            });

            const data = await res.json();

            if (!res.ok) {
                errorMessage.innerText = data.message;
            } else {
                alert("Signup successful!");
                window.location.href = "Login.html";
            }

        } catch (err) {
            console.error(err);
            errorMessage.innerText = "Server error.";
        }
    }

    // login
    else {
        try {
            const res = await fetch("/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email.value,
                    password: password.value
                })
            });

            const data = await res.json();

            if (!res.ok) {
                errorMessage.innerText = data.message;
            } else {
                alert("Login successful!");
                window.location.href = "FrontEnd.html";
            }

        } catch (err) {
            console.error(err);
            errorMessage.innerText = "Server error.";
        }
    }
});

// validation functions
function getSignupFormErrors(name, email, password, password2) {
    let errors = [];

    if (name.value.trim() === "") errors.push("Name is required");

    if (email.value.trim() === "") errors.push("Email is required");

    if (password.value.trim() === "") errors.push("Password is required");

    if (password.value.length < 8)
        errors.push("Password must be at least 8 characters");

    if (password.value !== password2.value)
        errors.push("Passwords do not match");

    return errors;
}

function getLoginFormErrors(email, password) {
    let errors = [];

    if (email.value.trim() === "")
        errors.push("Email is required");

    if (password.value.trim() === "")
        errors.push("Password is required");

    return errors;
}

// error cleanup
const allInputs = [nameField, email, password, password2].filter(x => x != null);

allInputs.forEach(input => {
    input.addEventListener("input", () => {
        errorMessage.innerText = "";
    });
});
