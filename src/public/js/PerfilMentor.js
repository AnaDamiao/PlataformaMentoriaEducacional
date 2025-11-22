// PerfilMentor.js
document.addEventListener("DOMContentLoaded", async () => {
    // --- Referências do DOM ---
    const mentorNomeElement = document.getElementById("mentorNome");
    const mentorAreaElement = document.getElementById("mentorArea");
    const mentorDispElement = document.getElementById("mentorDisponibilidade");
    const mentorFotoElement = document.getElementById("mentorFoto");
    const calendarGrid = document.getElementById('calendarGrid');
    const monthYearDisplay = document.getElementById('monthYear');
    const scheduleModal = document.getElementById('scheduleModal');
    const selectedDateDisplay = document.getElementById('selectedDate');
    const horariosContainer = document.getElementById('horariosContainer');
    const popupConfirmacao = document.getElementById('popupConfirmacao');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const closeModalBtn = document.getElementById('closeModal');

    let currentDate = new Date();
    let mentorData = null;
    let mentorAreas = [];
    let disp = {};

    if (mentorNomeElement) mentorNomeElement.textContent = "Carregando perfil...";

    const urlParams = new URLSearchParams(window.location.search);
    const mentorId = urlParams.get("id");

    async function buscarMentorPorId(id) {
        try {
            const res = await fetch(`/mentores/${id}`);
            if (!res.ok) return null;
            return await res.json();
        } catch (e) {
            console.error("Erro ao buscar mentor por ID:", e);
            return null;
        }
    }

    mentorData = await buscarMentorPorId(mentorId);

    if (!mentorData) {
        mentorNomeElement.textContent = "Perfil não encontrado.";
        mentorAreaElement.textContent = "Área: N/A";
        mentorDispElement.textContent = "Disponibilidade: N/A";
        return;
    }

    mentorFotoElement.src = mentorData.foto || "./img/defaultUser.png";
    mentorNomeElement.textContent = mentorData.nome || "Mentor(a) Indefinido";

    mentorAreas = mentorData.areaConhecimento || [];
    mentorAreaElement.textContent = `Áreas: ${mentorAreas.join(", ") || "Não informada"}`;

    disp = mentorData.disponibilidade || {};
    disp.dias = Array.isArray(disp.dias) ? disp.dias : [];
    disp.horaInicio = disp.horaInicio || "08:00";
    disp.horaFim = disp.horaFim || "18:00";

    let disponibilidadeTexto = "Indefinida";
    if (disp.dias.length > 0) {
        disponibilidadeTexto = `${disp.dias.join(", ")} — ${disp.horaInicio} às ${disp.horaFim}`;
    }
    mentorDispElement.textContent = `Disponibilidade: ${disponibilidadeTexto}`;

    const diasDaSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const nomesDosMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    function isAvailableDay(date) {
        if (disp.dias.length === 0) return false;
        const dayIndex = date.getDay();
        const diaNomeBase = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"][dayIndex];
        const normalizedDispDays = disp.dias.map(day => day.trim().toLowerCase());
        const normalizedDiaNomeBase = diaNomeBase.toLowerCase();
        if (normalizedDispDays.includes(normalizedDiaNomeBase)) return true;
        const normalizedNomeCurto = diaNomeBase.substring(0, 3).toLowerCase();
        if (normalizedDispDays.some(day => day.startsWith(normalizedNomeCurto))) return true;
        return false;
    }

    function renderCalendar() {
        calendarGrid.innerHTML = '';
        monthYearDisplay.textContent = `${nomesDosMeses[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

        // Cabeçalhos dias da semana
        diasDaSemana.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });

        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const firstDayIndex = firstDayOfMonth.getDay();

        for (let i = 0; i < firstDayIndex; i++) {
            calendarGrid.appendChild(document.createElement('div'));
        }

        const today = new Date();
        today.setHours(0,0,0,0);

        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'day-cell';
            dayCell.textContent = i;

            const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);

            if (dayDate < today) {
                dayCell.classList.add('past-day');
            } else if (isAvailableDay(dayDate)) {
                dayCell.classList.add('available-day');
                dayCell.dataset.date = dayDate.toISOString().split('T')[0];
                dayCell.addEventListener('click', () => openScheduleModal(dayDate));
            } else {
                dayCell.classList.add('unavailable-day');
            }

            if (dayDate.toDateString() === today.toDateString()) {
                dayCell.classList.add('today');
            }

            calendarGrid.appendChild(dayCell);
        }
    }

    function generateTimeSlots(startTimeStr, endTimeStr) {
        const slots = [];
        const [hStart, mStart] = startTimeStr.split(':').map(Number);
        const [hEnd, mEnd] = endTimeStr.split(':').map(Number);

        let start = hStart * 60 + mStart;
        let end = hEnd * 60 + mEnd;

        while (start < end) {
            const hour = Math.floor(start / 60);
            const minute = start % 60;
            slots.push(`${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`);
            start += 60;
        }
        return slots;
    }

    function openScheduleModal(date) {
        const dateStr = date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
        selectedDateDisplay.textContent = `Agendar em: ${dateStr}`;
        horariosContainer.innerHTML = '';

        const horarios = generateTimeSlots(disp.horaInicio, disp.horaFim);

        horarios.forEach(horario => {
            const btn = document.createElement("button");
            btn.classList.add("time-slot-btn");
            btn.textContent = horario;
            btn.addEventListener("click", () => confirmarAgendamento(dateStr, horario));
            horariosContainer.appendChild(btn);
        });

        scheduleModal.style.display = "flex";
    }

    function confirmarAgendamento(data, hora) {
        const alunoEmail = localStorage.getItem("usuario-logado-email");
        const alunoNome = localStorage.getItem("usuario-logado-nome") || alunoEmail;

        console.log(`Agendando sessão: ${mentorData.nome} e ${alunoNome} - ${data} ${hora}`);

        const novoAgendamento = criarAgendamento(
            mentorData.email,
            mentorData.nome,
            alunoEmail,
            alunoNome,
            data,
            hora,
            "https://meet.google.com/ziv-kkmn-ggp" // link fixo
        );

        popupConfirmacao.style.display = 'block';
        setTimeout(() => popupConfirmacao.style.display = 'none', 3000);
        scheduleModal.style.display = 'none';
    }

    prevMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth()-1); renderCalendar(); });
    nextMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth()+1); renderCalendar(); });
    closeModalBtn.addEventListener('click', () => scheduleModal.style.display = 'none');
    window.addEventListener('click', e => { if(e.target === scheduleModal) scheduleModal.style.display = 'none'; });

    if (mentorData) renderCalendar();
});
