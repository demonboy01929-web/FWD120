/* =========================================================
   SAU ADMISSIONS WEBSITE - PHP BACKEND INTEGRATION
   ========================================================= */

// Set this to your local PHP server URL (e.g., XAMPP or PHP built-in server)
const API_BASE_URL = "http://localhost:8000/api.php";
const SESSION_KEY = "sau_signed_in";

function isSignedIn() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch (e) {
    return false;
  }
}

function setSignedIn(value) {
  try {
    if (value) sessionStorage.setItem(SESSION_KEY, "1");
    else sessionStorage.removeItem(SESSION_KEY);
  } catch (e) { /* Storage blocked: ignore */ }
}

function showMessage(form, id, text, type) {
  let box = document.getElementById(id);
  if (!box) {
    box = document.createElement("p");
    box.id = id;
    box.setAttribute("role", "status");
    form.appendChild(box);
  }
  box.className = `form-message ${type || "error"}`;
  box.textContent = text;
  box.hidden = !text;
}

document.addEventListener("DOMContentLoaded", () => {

  // 1. Submit Application to PHP Backend
  const applyForm = document.getElementById("apply-form");
  if (applyForm) {
    const modeSelect = applyForm.querySelector("#mode");
    const levelSelect = applyForm.querySelector("#level");
    const programmeSelect = applyForm.querySelector("#programme");

    applyForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const field = (name) => applyForm.elements[name].value.trim();
      const name = field("name");
      const email = field("email");
      const phone = field("phone");
      const password = applyForm.elements.password.value;
      const confirm = applyForm.elements.confirm.value;

      let error = "";
      if (name.length < 3) error = "Please enter your full name.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) error = "Please enter a valid email address.";
      else if (!modeSelect.value) error = "Please choose an admission mode.";
      else if (!levelSelect.value) error = "Please choose a programme level.";
      else if (!programmeSelect.value) error = "Please choose a programme.";
      else if (password.length < 8) error = "Password must be at least 8 characters.";
      else if (password !== confirm) error = "Passwords do not match.";

      if (error) {
        showMessage(applyForm, "apply-message", error, "error");
        return;
      }

      const payload = {
        name,
        email,
        phone,
        mode: modeSelect.options[modeSelect.selectedIndex].text,
        level: levelSelect.options[levelSelect.selectedIndex].text,
        programme: programmeSelect.value,
        password
      };

      try {
        // Appending endpoint parameter for api.php routing
        const response = await fetch(`${API_BASE_URL}?endpoint=apply.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to submit application.");
        }

        // Save server-returned session data locally
        sessionStorage.setItem("sau_applicant", JSON.stringify({
          ...payload,
          studentId: result.studentId,
          status: "Submitted"
        }));
        setSignedIn(true);

        window.location.href = "profile.html";
      } catch (err) {
        showMessage(applyForm, "apply-message", err.message, "error");
      }
    });
  }

  // 2. Student Portal Login via PHP Backend
  const portalForm = document.querySelector(".portal-login form");
  if (portalForm) {
    portalForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const idField = portalForm.querySelector("#student-id");
      const passField = portalForm.querySelector("#password");
      const identifier = idField.value.trim();
      const password = passField.value;

      try {
        const response = await fetch(`${API_BASE_URL}?endpoint=login.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, password })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Invalid credentials.");
        }

        sessionStorage.setItem("sau_applicant", JSON.stringify(result.applicant));
        setSignedIn(true);

        window.location.href = "profile.html";
      } catch (err) {
        showMessage(portalForm, "portal-message", err.message, "error");
        passField.value = "";
        passField.focus();
      }
    });
  }

});