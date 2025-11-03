const calendarGrid = document.getElementById("calendarGrid");
const monthYear = document.getElementById("monthYear");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");

let currentDate = new Date();

function renderCalendar(date) {
  calendarGrid.innerHTML = "";
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  monthYear.textContent = date.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric"
  });

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    calendarGrid.appendChild(empty);
  }

  for (let day = 1; day <= lastDate; day++) {
    const dayEl = document.createElement("div");
    dayEl.classList.add("calendar-day");
    dayEl.textContent = day;

    dayEl.addEventListener("click", () => openModal(day, month, year));
    calendarGrid.appendChild(dayEl);
  }
}

prevMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar(currentDate);
});

nextMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(currentDate);
});

// Modal
const modal = document.getElementById("scheduleModal");
const closeModalBtn = document.getElementById("closeModal");
const selectedDateEl = document.getElementById("selectedDate");
const horariosContainer = document.getElementById("horariosContainer");

// Exemplo de horários já ocupados
const ocupadosExemplo = {
  "2025-09-12": ["10:00", "15:00", "18:00"],
  "2025-09-14": ["09:00", "11:00", "16:00"],
  "2025-09-16": ["14:00", "17:00"]
};

function openModal(day, month, year) {
  const selectedDate = new Date(year, month, day);
  const dateKey = selectedDate.toISOString().split("T")[0]; // formato YYYY-MM-DD

  selectedDateEl.textContent =
    "Agendar sessão em " +
    selectedDate.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long"
    });

  horariosContainer.innerHTML = "";

  // Gerar horários de 08h às 20h
  for (let hour = 8; hour <= 20; hour++) {
    const horaStr = `${hour.toString().padStart(2, "0")}:00`;
    const btn = document.createElement("button");
    btn.textContent = horaStr;
    btn.classList.add("horario");

    // Marcar ocupados
    if (ocupadosExemplo[dateKey]?.includes(horaStr)) {
      btn.classList.add("ocupado");
      btn.disabled = true;
    } else {
      btn.addEventListener("click", () => {
        alert(`Sessão agendada para ${horaStr} em ${selectedDate.toLocaleDateString("pt-BR")}`);
        btn.style.background = "#28a745";
      });
    }

    horariosContainer.appendChild(btn);
  }

  modal.style.display = "block";
}

closeModalBtn.onclick = () => (modal.style.display = "none");
window.onclick = (e) => {
  if (e.target == modal) modal.style.display = "none";
};

renderCalendar(currentDate);

function mostrarPopup() {
  const popup = document.getElementById("popupConfirmacao");
  popup.style.display = "block";

  // Esconde após 3s
  setTimeout(() => {
    popup.style.display = "none";
  }, 3000);
}
btn.addEventListener("click", () => {
  btn.style.background = "#28a745";
  mostrarPopup();
});
