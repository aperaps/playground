async function loadModules() {
    try {
        const response = await fetch('data/modules.json');
        const data = await response.json();

        const container = document.getElementById('modules');

        data.modules.forEach(mod => {
            const card = document.createElement('div');
            card.className = 'module-card';

            card.innerHTML = `
                <div class="module-title">${mod.title}</div>
                <div class="module-content" id="${mod.id}"></div>
            `;

            // WICHTIG: Karte zuerst ins DOM hängen
            container.appendChild(card);

            const contentEl = card.querySelector(".module-content");

            if (mod.type === "shoutbox") {
                renderShoutbox(contentEl);
            } else {
                contentEl.innerHTML = mod.content || "";
            }
        });

    } catch (error) {
        console.error("Fehler beim Laden der Module:", error);
    }
}


// ------------------------------
// SHOUTBOX STORAGE
// ------------------------------
function getShoutMessages() {
    return JSON.parse(localStorage.getItem("shoutbox") || "[]");
}

function saveShoutMessages(messages) {
    localStorage.setItem("shoutbox", JSON.stringify(messages));
}

// ------------------------------
// PASSWORD HASHING
// ------------------------------
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

// ------------------------------
// LOCAL STORAGE HELPERS
// ------------------------------
function getUsers() {
    return JSON.parse(localStorage.getItem("users") || "[]");
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser"));
}

function setCurrentUser(user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
}

function logout() {
    localStorage.removeItem("currentUser");
    updateAccountUI();
}

// ------------------------------
// UI UPDATE
// ------------------------------
function updateAccountUI() {
    const user = getCurrentUser();
    const avatar = document.getElementById("accountAvatar");

    const menuLogin = document.getElementById("menuLogin");
    const menuRegister = document.getElementById("menuRegister");
    const menuLogout = document.getElementById("menuLogout");
    const menuProfile = document.getElementById("menuProfile");

    if (user) {
        avatar.textContent = user.username[0].toUpperCase();
        menuLogin.classList.add("hidden");
        menuRegister.classList.add("hidden");
        menuLogout.classList.remove("hidden");
        menuProfile.classList.remove("hidden");
    } else {
        avatar.textContent = "?";
        menuLogin.classList.remove("hidden");
        menuRegister.classList.remove("hidden");
        menuLogout.classList.add("hidden");
        menuProfile.classList.add("hidden");
    }
}

// ------------------------------
// MENU TOGGLE
// ------------------------------
document.getElementById("accountAvatar").addEventListener("click", () => {
    document.getElementById("accountMenu").classList.toggle("hidden");
});

// ------------------------------
// LOGIN
// ------------------------------
document.getElementById("menuLogin").addEventListener("click", () => {
    document.getElementById("loginModal").classList.remove("hidden");
});

document.getElementById("loginSubmit").addEventListener("click", async () => {
    const username = document.getElementById("loginUser").value;
    const password = document.getElementById("loginPass").value;

    const users = getUsers();
    const hashed = await hashPassword(password);

    const user = users.find(u => u.username === username && u.password === hashed);

    if (user) {
        setCurrentUser({ username });
        updateAccountUI();
        document.getElementById("loginModal").classList.add("hidden");
    } else {
        alert("Falsche Login-Daten");
    }
});

// ------------------------------
// REGISTER
// ------------------------------
document.getElementById("menuRegister").addEventListener("click", () => {
    document.getElementById("registerModal").classList.remove("hidden");
});

document.getElementById("regSubmit").addEventListener("click", async () => {
    const username = document.getElementById("regUser").value;
    const password = document.getElementById("regPass").value;

    const users = getUsers();

    if (users.some(u => u.username === username)) {
        alert("Benutzername existiert bereits");
        return;
    }

    const hashed = await hashPassword(password);

    users.push({
        username,
        password: hashed,
        created: new Date().toISOString()
    });

    saveUsers(users);
    alert("Registrierung erfolgreich");
    document.getElementById("registerModal").classList.add("hidden");
});

// ------------------------------
// PROFILE
// ------------------------------
document.getElementById("menuProfile").addEventListener("click", () => {
    const user = getCurrentUser();
    document.getElementById("profileName").textContent = "Benutzer: " + user.username;
    document.getElementById("profileModal").classList.remove("hidden");
});

// ------------------------------
// LOGOUT
// ------------------------------
document.getElementById("menuLogout").addEventListener("click", () => {
    logout();
});

// ------------------------------
// MODAL CLOSE
// ------------------------------
document.querySelectorAll(".modal-close").forEach(btn => {
    btn.addEventListener("click", () => {
        btn.closest(".modal").classList.add("hidden");
    });
});


// ------------------------------
// RENDER SHOUTBOX
// ------------------------------
function renderShoutbox(container) {
    container.innerHTML = `
        <div class="shoutbox-container">
            <div class="shoutbox-messages"></div>

            <div class="shoutbox-input">
                <input type="text" placeholder="Nachricht eingeben...">
                <button>Senden</button>
            </div>
        </div>
    `;

    const list = container.querySelector(".shoutbox-messages");
    const input = container.querySelector("input");
    const button = container.querySelector("button");

    // UI abhängig vom Login-Status
    const user = getCurrentUser();
    const inputArea = container.querySelector(".shoutbox-input");
    inputArea.style.display = user ? "flex" : "none";

    // Nachrichten laden
    loadShoutboxMessages(list);

    // Klick-Event
    button.addEventListener("click", () => sendShoutMessage(input, list));
}

function updateShoutboxUI() {
    const user = getCurrentUser();
    const inputArea = document.getElementById("shoutInputArea");

    if (!inputArea) return;

    if (user) {
        inputArea.style.display = "flex";
    } else {
        inputArea.style.display = "none";
    }
}

function loadShoutboxMessages(list) {
    const messages = getShoutMessages();
    list.innerHTML = "";

    messages.forEach(msg => {
        const div = document.createElement("div");
        div.className = "shoutbox-message";

        div.innerHTML = `
            <div>${msg.text}</div>
            <div class="shoutbox-meta">${msg.user} • ${msg.time}</div>
        `;

        list.appendChild(div);
    });

    list.scrollTop = list.scrollHeight;
}


function sendShoutMessage(input, list) {
    const user = getCurrentUser();

    if (!user) {
        alert("Bitte zuerst anmelden.");
        return;
    }

    const text = input.value.trim();
    if (text === "") return;

    const messages = getShoutMessages();

    messages.push({
        user: user.username,
        text,
        time: new Date().toLocaleTimeString()
    });

    saveShoutMessages(messages);
    input.value = "";

    loadShoutboxMessages(list);
}


// ------------------------------
// INIT
// ------------------------------
updateAccountUI();
loadModules();
