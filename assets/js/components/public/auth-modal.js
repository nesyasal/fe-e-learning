import { registerUser, loginUser } from "../../api/auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.querySelector("#test-form2");
  const loginForm = document.querySelector("#test-form");

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("Register form submitted!");

      const data = {
        full_name: registerForm.querySelector("#full_name").value,
        username: registerForm.querySelector("#username").value,
        email: registerForm.querySelector("#email").value,
        password: registerForm.querySelector("#password").value,
      };

      try {
        const res = await registerUser(data);
        alert("Register success!");
        console.log(res);
      } catch (err) {
        alert("Failed to register.");
        console.error(err);
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const data = {
        email: loginForm.querySelector("#email").value,
        password: loginForm.querySelector("#password").value,
      };

      try {
        const res = await loginUser(data);
        localStorage.setItem("token", res.token); // simpan token
        alert("Login success!");
        window.location.href = "pages/app/dashboard.html";
      } catch (err) {
        alert("Login failed.");
        console.error(err);
      }
    });
  }
});
