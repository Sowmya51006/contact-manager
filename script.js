const API_URL = "http://localhost:5000/api/contacts";
let contacts = [];
let editId = null;

// Modal Elements
const modal = document.getElementById("contactModal");
const modalTitle = document.getElementById("modalTitle");

async function fetchContacts() {
    try {
        const response = await fetch(API_URL);
        contacts = await response.json();
        displayContacts();
    } catch (error) {
        console.error("Error fetching contacts:", error);
    }
}

function displayContacts(filteredContacts = contacts) {
    const list = document.getElementById("contactList");
    list.innerHTML = "";

    if (filteredContacts.length === 0) {
        list.innerHTML = `<div class="empty-state">No contacts found. Add one to get started!</div>`;
        return;
    }

    filteredContacts.forEach((contact, index) => {
        const card = document.createElement("div");
        card.className = "contact-card";
        card.style.animationDelay = `${index * 0.05}s`;

        card.innerHTML = `
            <div class="contact-info">
                <h3>${contact.name}</h3>
                <p><i class="fas fa-phone"></i> ${contact.phone}</p>
                <p><i class="fas fa-envelope"></i> ${contact.email || "No email"}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${contact.address || "No address"}</p>
            </div>
            <div class="actions">
                <button class="btn-icon edit-btn" onclick="editContact('${contact._id}')" title="Edit Contact">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-icon delete-btn" onclick="deleteContact('${contact._id}')" title="Delete Contact">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        list.appendChild(card);
    });
}

async function saveContact() {
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const address = document.getElementById("address").value.trim();

    if (name === "" || phone === "") {
        alert("Name and Phone are required!");
        return;
    }

    const contactData = { name, phone, email, address };

    try {
        let response;
        if (editId === null) {
            response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(contactData)
            });
        } else {
            response = await fetch(`${API_URL}/${editId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(contactData)
            });
            editId = null;
        }

        if (response.ok) {
            closeModal();
            fetchContacts();
        } else {
            const error = await response.json();
            alert("Error saving contact: " + error.message);
        }
    } catch (error) {
        console.error("Error saving contact:", error);
    }
}

function editContact(id) {
    const contact = contacts.find(c => c._id === id);
    if (!contact) return;

    document.getElementById("name").value = contact.name;
    document.getElementById("phone").value = contact.phone;
    document.getElementById("email").value = contact.email || "";
    document.getElementById("address").value = contact.address || "";

    editId = id;
    modalTitle.innerText = "Edit Contact";
    openModal(true);
}

async function deleteContact(id) {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            fetchContacts();
        } else {
            alert("Error deleting contact");
        }
    } catch (error) {
        console.error("Error deleting contact:", error);
    }
}

function openModal(isEdit = false) {
    if (!isEdit) {
        clearForm();
        modalTitle.innerText = "Add New Contact";
    }
    modal.style.display = "flex";
}

function closeModal() {
    modal.style.display = "none";
    clearForm();
}

function clearForm() {
    document.getElementById("name").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("email").value = "";
    document.getElementById("address").value = "";
    editId = null;
}

// Close modal when clicking outside
window.onclick = function (event) {
    if (event.target == modal) {
        closeModal();
    }
}

document.getElementById("search").addEventListener("input", debounce(async function () {
    const searchValue = this.value;

    if (searchValue.trim() === "") {
        fetchContacts();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(searchValue)}`);
        const results = await response.json();
        displayContacts(results);
    } catch (error) {
        console.error("Error searching contacts:", error);
    }
}, 300));

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initial fetch
fetchContacts();

