const registerForm = document.querySelector("#registerForm");
const loginForm = document.querySelector("#loginForm");
const message = document.querySelector("#message");

// Register
if (registerForm) {
  registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.querySelector("#name").value;
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "/pages/dashboard.html";
      } else {
        message.innerText = data.message;
      }
    } catch (error) {
      message.innerText = "Something went wrong! Please Try Again!.";
      console.error(error);
    }
  });
}

// Login
if (loginForm) {
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "/pages/dashboard.html";
      } else {
        message.innerText = data.message;
      }
    } catch (error) {
      message.innerText = "Something went! Please Try Again!.";
      console.error(error);
    }
  });
}