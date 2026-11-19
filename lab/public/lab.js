// Every lab page behavior lives here, wired by data-lab attributes.
const $ = (sel, root = document) => root.querySelector(sel);

const handlers = {
  signup(form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const out = $("#result");
      if (!name || !/^\S+@\S+\.\S+$/.test(email)) {
        out.textContent = "Please enter a name and a valid email.";
        out.className = "error";
        return;
      }
      out.textContent = `Welcome ${name}, you're on the ${form.plan.value} plan.`;
      out.className = "";
    });
  },

  "login-error"(el) {
    if (new URLSearchParams(location.search).has("error")) el.hidden = false;
  },

  checkout(button) {
    button.addEventListener("click", async () => {
      const items = [...document.querySelectorAll("[data-lab=cart] tbody tr")].map((row) => ({
        price: Number(row.dataset.price),
        qty: Number($("input", row).value),
      }));
      const res = await fetch("/api/checkout", { method: "POST", body: JSON.stringify({ items }) });
      const { total } = await res.json();
      $("#total").textContent = `$${total.toFixed(2)}`;
    });
  },

  delete(button) {
    button.addEventListener("click", () => {
      $("#outcome").textContent = confirm("Delete this project for good?") ? "Project deleted" : "Kept";
    });
  },

  newsletter(form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      $("#nl-status").textContent = `Subscribed ${$("#nl-email").value}`;
    });
  },
};

for (const el of document.querySelectorAll("[data-lab]")) handlers[el.dataset.lab]?.(el);
