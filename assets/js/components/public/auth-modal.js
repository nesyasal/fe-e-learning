import { registerUser, loginUser } from "../../api/auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.querySelector("#test-form2");
  const loginForm = document.querySelector("#test-form");

  if (registerForm) {
    // Helper validation functions
    const validateEmail = (email) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const showFieldError = (inputEl, msg) => {
      if (!inputEl) return;
      let err = inputEl.parentElement.querySelector(".field-error");
      if (!err) {
        err = document.createElement("div");
        err.className = "field-error";
        err.style.color = "red";
        err.style.fontSize = "0.9em";
        err.style.marginTop = "6px";
        inputEl.parentElement.appendChild(err);
      }
      err.textContent = msg;
    };

    const clearFieldError = (inputEl) => {
      if (!inputEl) return;
      const err = inputEl.parentElement.querySelector(".field-error");
      if (err) err.textContent = "";
    };

    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fullNameEl = registerForm.querySelector("#full_name");
      const usernameEl = registerForm.querySelector("#username");
      const emailEl = registerForm.querySelector("#email");
      const passwordEl = registerForm.querySelector("#password");
      const submitBtn = registerForm.querySelector('button[type="submit"]');

      // Clear previous errors
      [fullNameEl, usernameEl, emailEl, passwordEl].forEach(clearFieldError);

      const full_name = (fullNameEl?.value || "").trim();
      const username = (usernameEl?.value || "").trim();
      const email = (emailEl?.value || "").trim();
      const password = passwordEl?.value || "";

      let hasError = false;

      if (!full_name) {
        showFieldError(fullNameEl, "Full name is required.");
        hasError = true;
      }

      if (!username) {
        showFieldError(usernameEl, "Username is required.");
        hasError = true;
      }

      if (!email) {
        showFieldError(emailEl, "Email is required.");
        hasError = true;
      } else if (!validateEmail(email)) {
        showFieldError(emailEl, "Please enter a valid email address.");
        hasError = true;
      }

      if (!password) {
        showFieldError(passwordEl, "Password is required.");
        hasError = true;
      } else if (password.length < 6) {
        showFieldError(passwordEl, "Password must be at least 6 characters.");
        hasError = true;
      }

      if (hasError) return;

      const data = { full_name, username, email, password };

      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.dataset.origText = submitBtn.textContent;
          submitBtn.textContent = "Registering...";
        }

        const res = await registerUser(data);

        // Success: inform user and close modal if Magnific Popup is available
        try {
          if (window.Swal) {
            Swal.fire({
              icon: "success",
              title: "Pendaftaran Berhasil",
              text: "Pendaftaran berhasil. Silakan login.",
            });
          } else {
            alert("Registration successful. You can now sign in.");
          }
        } catch (e) {
          console.warn("swal failed", e);
        }

        try {
          if (window.jQuery && typeof jQuery.magnificPopup === "object") {
            jQuery.magnificPopup.close();
          } else if (window.$ && window.$.magnificPopup) {
            window.$.magnificPopup.close();
          }
        } catch (e) {
          // ignore
        }

        console.log("Register response:", res);
      } catch (err) {
        // Try to show backend message if available
        let msg = "Failed to register.";
        try {
          if (err?.message) msg = err.message;
        } catch (e) {}
        if (window.Swal) {
          Swal.fire({ icon: "error", title: "Gagal", text: msg });
        } else {
          alert(msg);
        }
        console.error(err);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          if (submitBtn.dataset.origText)
            submitBtn.textContent = submitBtn.dataset.origText;
        }
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
        // Save token and user info returned by backend
        if (res.token) localStorage.setItem("token", res.token);
        if (res.user) localStorage.setItem("user", JSON.stringify(res.user));

        // Redirect based on role
        const role = res.user?.role || "user";
        if (role === "admin") {
          window.location.href = "admin-dashboard.html";
        } else if (role === "instructor") {
          window.location.href = "instructor-dashboard.html";
        } else {
          // regular user stays on index
          window.location.href = "index.html";
        }
      } catch (err) {
        if (window.Swal) {
          Swal.fire({
            icon: "error",
            title: "Login Gagal",
            text: "Login failed.",
          });
        } else {
          alert("Login failed.");
        }
        console.error(err);
      }
    });
  }
});
