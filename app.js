const umbrellas = Array.from({ length: 10 }, (_, i) => i + 1); // Ombrelloni 1-10
const cabins = Array.from({ length: 5 }, (_, i) => i + 1);     // Cabine 1-5

const bookings = [];

const umbrellaSelect = document.getElementById("umbrellaNumber");
const cabinSelect = document.getElementById("cabinNumber");
const bookingForm = document.getElementById("bookingForm");
const bookingList = document.getElementById("bookingList");
const bookingDateInput = document.getElementById("bookingDate");

// Salva prenotazioni su localStorage
function saveBookings() {
    localStorage.setItem("bookings", JSON.stringify(bookings));
}

// Carica prenotazioni da localStorage (se presenti)
function loadBookings() {
    const data = localStorage.getItem("bookings");
    if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
            bookings.push(...parsed);
        }
    }
}

// Imposta limiti data nel campo date
function setDateLimits() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;
    const maxDateStr = "2025-09-30";

    bookingDateInput.min = todayStr;
    bookingDateInput.max = maxDateStr;

    if (!bookingDateInput.value || bookingDateInput.value < todayStr || bookingDateInput.value > maxDateStr) {
        bookingDateInput.value = todayStr;
    }
}

// Popola le opzioni disponibili in base alla data
function populateOptions() {
    const selectedDate = bookingDateInput.value;

    umbrellaSelect.innerHTML = '<option value="">-- None --</option>';
    umbrellas.forEach(num => {
        if (!bookings.some(b => b.umbrella == num && b.date === selectedDate)) {
            const option = document.createElement("option");
            option.value = num;
            option.textContent = `Umbrella #${num}`;
            umbrellaSelect.appendChild(option);
        }
    });

    cabinSelect.innerHTML = '<option value="">-- None --</option>';
    cabins.forEach(num => {
        if (!bookings.some(b => b.cabin == num && b.date === selectedDate)) {
            const option = document.createElement("option");
            option.value = num;
            option.textContent = `Cabin #${num}`;
            cabinSelect.appendChild(option);
        }
    });
}

// Visualizza prenotazioni con pulsante "Remove"
function renderBookings(list = bookings) {
    bookingList.innerHTML = "";

    list.forEach((b, index) => {
        const li = document.createElement("li");

        let text = `${b.name} booked `;
        if (b.umbrella) text += `Umbrella #${b.umbrella} `;
        if (b.cabin) text += `Cabin #${b.cabin} `;
        text += `on ${b.date}`;

        li.textContent = text.trim();

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";
        removeBtn.style.marginLeft = "10px";
        removeBtn.style.backgroundColor = "#d32f2f";
        removeBtn.style.color = "white";
        removeBtn.style.border = "none";
        removeBtn.style.padding = "5px 10px";
        removeBtn.style.borderRadius = "5px";
        removeBtn.style.cursor = "pointer";

        removeBtn.addEventListener("click", () => {
            const realIndex = bookings.findIndex(entry =>
                entry.name === b.name &&
                entry.date === b.date &&
                entry.umbrella === b.umbrella &&
                entry.cabin === b.cabin
            );
            if (realIndex !== -1) {
                bookings.splice(realIndex, 1);
                saveBookings();
                populateOptions();
                renderBookings();
            }
        });

        li.appendChild(removeBtn);
        bookingList.appendChild(li);
    });
}

// Eventi principali
loadBookings();
setDateLimits();
populateOptions();
renderBookings();

bookingForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("customerName").value.trim();
    const umbrella = umbrellaSelect.value ? parseInt(umbrellaSelect.value) : null;
    const cabin = cabinSelect.value ? parseInt(cabinSelect.value) : null;
    const date = bookingDateInput.value;

    if (!name) {
        alert("Please enter customer name.");
        return;
    }

    if (!umbrella && !cabin) {
        alert("Please select at least an umbrella or a cabin.");
        return;
    }

    if (!date) {
        alert("Please select a booking date.");
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date("2025-09-30");
    maxDate.setHours(23, 59, 59, 999);

    const selectedDate = new Date(date);

    if (selectedDate < today || selectedDate > maxDate) {
        alert("Booking date must be between today and September 30, 2025.");
        return;
    }

    bookings.push({ name, umbrella, cabin, date });
    saveBookings();

    bookingForm.reset();
    setDateLimits();
    populateOptions();
    renderBookings();
});

bookingDateInput.addEventListener("change", () => {
    populateOptions();
});

// 🔍 FILTRI

function applyFilters() {
    const nameFilter = document.getElementById("filterName").value.trim().toLowerCase();

    //const nameFilter = document.getElementById("filterName").value.toLowerCase();
    const dateFilter = document.getElementById("filterDate").value;
    const stored = JSON.parse(localStorage.getItem("bookings")) || [];

    const filtered = stored.filter(b => {
        const matchName = b.name.toLowerCase().includes(nameFilter);
        const matchDate = dateFilter ? b.date === dateFilter : true;
        return matchName && matchDate;
    });

    renderBookings(filtered);
}

function resetFilters() {
    document.getElementById("filterName").value = "";
    document.getElementById("filterDate").value = "";
    renderBookings(JSON.parse(localStorage.getItem("bookings")) || []);
}

document.getElementById("toggleStorageBtn").addEventListener("click", () => {
    const output = document.getElementById("storageOutput");
    const btn = document.getElementById("toggleStorageBtn");

    if (output.style.display === "none") {
        const data = localStorage.getItem("bookings");
        output.innerHTML = ""; // Pulisce

        if (!data) {
            output.innerHTML = "<p>No reservations found.</p>";
        } else {
            try {
                const parsed = JSON.parse(data);
                if (parsed.length === 0) {
                    output.innerHTML = "<p>No reservations found.</p>";
                } else {
                    const ul = document.createElement("ul");
                    parsed.forEach(b => {
                        const li = document.createElement("li");
                        let txt = `${b.name} - `;
                        if (b.umbrella) txt += `Ombrellone #${b.umbrella}`;
                        if (b.umbrella && b.cabin) txt += ", ";
                        if (b.cabin) txt += `Cabina #${b.cabin}`;
                        txt += `, Data: ${b.date}`;
                        li.textContent = txt;
                        ul.appendChild(li);
                    });
                    output.appendChild(ul);
                }
            } catch (e) {
                output.innerHTML = "<p>Failed to load bookings.</p>";
            }
        }

        output.style.display = "block";
        btn.textContent = "Hide Bookings";
    } else {
        output.style.display = "none";
        btn.textContent = "Show Bookings";
    }
});


