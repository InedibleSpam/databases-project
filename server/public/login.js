const loginForm = document.getElementById("loginForm");

if (loginForm) {
  const emailField = document.getElementById("email");
  const passwordField = document.getElementById("password");
  const errorMessage = document.getElementById("error-message");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    let errors = [];
    if (!emailField.value.trim()) errors.push("Email required");
    if (!passwordField.value.trim()) errors.push("Password required");

    if (errors.length > 0) {
      errorMessage.innerText = errors.join(", ");
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailField.value,
          password: passwordField.value,
        }),
      });

      const data = await res.json();
      alert(data.message);

      if (res.ok) {
        localStorage.setItem("userId", data.user.use_id);

        window.location.href = "frontend.html";
      }

    } catch (err) {
      console.error(err);
      alert("Server error, please try again later.");
    }
  });
}
