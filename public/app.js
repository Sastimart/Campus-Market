const listings = document.getElementById("listings");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

const modal = document.getElementById("modal");
const sellBtn = document.getElementById("sellBtn");
const closeModal = document.getElementById("closeModal");
const form = document.getElementById("listingForm");

let selectedCategory = "";

async function loadListings() {
  const params = new URLSearchParams();

  if (selectedCategory) {
    params.set("category", selectedCategory);
  }

  if (searchInput.value.trim()) {
    params.set("q", searchInput.value.trim());
  }

  const response = await fetch("/api/listings?" + params.toString());
  const data = await response.json();

  listings.innerHTML = "";

  if (!data.length) {
    listings.innerHTML = "<p>No listings found.</p>";
    return;
  }

  data.forEach(item => {
    const card = document.createElement("article");

    card.className = "card";

    card.innerHTML = `
      <div class="emoji">📦</div>

      <h3>${escapeHtml(item.title)}</h3>

      <div class="price">
        ${item.type === "free" ? "FREE" : "₹" + item.price}
      </div>

      <p>${escapeHtml(item.description || "")}</p>

      <div class="meta">
        ${escapeHtml(item.category)} ·
        ${escapeHtml(item.campus)}
      </div>

      <div class="meta">
        Seller: ${escapeHtml(item.seller_name)}
      </div>

      <br>

      <button class="primary">
        Chat with Seller
      </button>
    `;

    listings.appendChild(card);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.querySelectorAll("[data-category]").forEach(button => {
  button.addEventListener("click", () => {
    selectedCategory = button.dataset.category;
    loadListings();
  });
});

searchBtn.addEventListener("click", loadListings);

searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    loadListings();
  }
});

sellBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

closeModal.addEventListener("click", () => {
  modal.classList.add("hidden");
});

form.addEventListener("submit", async e => {
  e.preventDefault();

  const formData = new FormData(form);

  const body = {
    title: formData.get("title"),
    description: formData.get("description"),
    price: Number(formData.get("price")),
    type: formData.get("type"),
    category: formData.get("category"),
    campus: formData.get("campus"),
    seller_name: formData.get("seller_name")
  };

  const response = await fetch("/api/listings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (response.ok) {
    form.reset();
    modal.classList.add("hidden");
    loadListings();
  } else {
    alert("Could not publish listing.");
  }
});

loadListings();
