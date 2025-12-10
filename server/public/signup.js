const signupForm = document.getElementById("signupForm");
if (signupForm) {
    const fnameField = document.getElementById("fname");
    const lnameField = document.getElementById("lname");
    const emailField = document.getElementById("email");
    const passwordField = document.getElementById("password");
    const password2Field = document.getElementById("password2");
    const errorMessage = document.getElementById("error-message");

    signupForm.addEventListener("submit", async e => {
        e.preventDefault();
        let errors = [];

        if (!fnameField.value.trim()) errors.push("First Name required");
        if (!lnameField.value.trim()) errors.push("Last Name required");
        if (!emailField.value.trim()) errors.push("Email required");
        if (!passwordField.value.trim()) errors.push("Password required");
        if (passwordField.value.length < 8) errors.push("Password too short");
        if (passwordField.value !== password2Field.value) errors.push("Passwords mismatch");

        if (errors.length > 0) {
            errorMessage.innerText = errors.join(", ");
            return;
        }

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    first_name: fnameField.value,
                    last_name: lnameField.value,
                    email: emailField.value,
                    password: passwordField.value
                })
            });
            const data = await res.json();
            alert(data.message);
            if (res.ok) window.location.href = "login.html";
        } catch (err) {
            console.error(err);
            alert("Server error, please try again later.");
        }
    });
}
