document.addEventListener("DOMContentLoaded", () => {
    // --- 1. Referências do DOM ---
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

    if (mentorNomeElement) mentorNomeElement.textContent = "Carregando perfil...";

    // --- 2. FUNÇÕES DE BUSCA E SALVAMENTO ---

    // Função para buscar dados de um usuário pelo email no Local Storage
    function buscarMentorData(mentorEmailURL) {
        if (!mentorEmailURL) return null;
        
        const emailNormalizado = mentorEmailURL.trim().toLowerCase();
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            
            if (key.startsWith("user-data-")) { 
                try {
                    const user = JSON.parse(localStorage.getItem(key));
                    
                    if (user && user.email && user.email.trim().toLowerCase() === emailNormalizado) {
                        return user; 
                    }
                } catch (e) {
                    console.error(`Falha ao ler dados de ${key}. Verifique a sintaxe JSON no Local Storage.`, e);
                }
            }
        }
        return null;
    }

    // Função para salvar o agendamento no perfil do estudante logado
    function salvarAgendamentoParaEstudante(mentor, dataAgendamentoISO, horaAgendamento) {
        const loggedUserKey = localStorage.getItem('usuario-logado');
        if (!loggedUserKey) {
            console.error("Erro: Nenhum estudante logado encontrado. Agendamento não salvo.");
            // Opcional: Redirecionar para login
            // window.location.href = "Cadastro.html"; 
            return;
        }

        const estudanteKey = loggedUserKey;
        const estudanteDataStr = localStorage.getItem(estudanteKey);

        if (!estudanteDataStr) {
            console.error(`Erro: Dados do estudante logado não encontrados para a chave: ${estudanteKey}`);
            return;
        }

        try {
            let estudanteData = JSON.parse(estudanteDataStr);

            // Garante que o array de agendamentos existe
            if (!estudanteData.agendamentos) {
                estudanteData.agendamentos = [];
            }
            
            // Formata a data de YYYY-MM-DD para DD/MM/AAAA para exibição
            const [ano, mes, dia] = dataAgendamentoISO.split('-');
            const dataFormatada = `${dia}/${mes}/${ano}`;
            
            // Cria o objeto conforme o formato solicitado
            const novoAgendamento = {
                mentorNome: mentor.nome || "Mentor Indefinido",
                area: mentorAreas[0] || "Geral", // Área de interesse principal do mentor
                data: dataFormatada,
                hora: horaAgendamento
            };

            // Adiciona o novo agendamento
            estudanteData.agendamentos.push(novoAgendamento);

            // Salva o objeto do estudante de volta no Local Storage
            localStorage.setItem(estudanteKey, JSON.stringify(estudanteData));
            console.log("Agendamento salvo com sucesso no perfil do estudante:", novoAgendamento);

        } catch (e) {
            console.error("Erro ao salvar agendamento ou parsear dados do estudante.", e);
        }
    }


    // --- 3. INÍCIO DO PROCESSO: BUSCA E CARREGAMENTO ---
    const urlParams = new URLSearchParams(window.location.search);
    const mentorEmailURL = urlParams.get("mentorEmail");
    
    mentorData = buscarMentorData(mentorEmailURL);

    if (!mentorData) {
        if (mentorNomeElement) mentorNomeElement.textContent = "Perfil não encontrado. Dados não carregados.";
        if (mentorAreaElement) mentorAreaElement.textContent = "Área: N/A";
        if (mentorDispElement) mentorDispElement.textContent = "Disponibilidade: N/A";
        return; 
    }

    const emailNormalizado = mentorData.email.trim().toLowerCase();
    
    // BLOCO DE ADAPTAÇÃO DE DADOS (Correção para Rodrigo Nogueira)
    let disp = mentorData.disponibilidade || {};
    
    // Leitura estrita de horários
    disp.dias = disp.dias ?? mentorData.dias;
    disp.horaInicio = (disp.horaInicio ?? mentorData.horaInicio) ?? ""; 
    disp.horaFim = (disp.horaFim ?? mentorData.horaFim) ?? "";         

    // Se disp.dias for uma STRING, converte para array.
    if (typeof disp.dias === 'string') {
        disp.dias = disp.dias.split(',').map(day => day.trim());
    }

    // Garante que disp.dias seja sempre um array
    disp.dias = Array.isArray(disp.dias) ? disp.dias : [];

    // Carrega Áreas (para usar no salvamento)
    mentorAreas = mentorData.perfil?.areaConhecimento || [];

    // Foto (Correção para Breno)
    const storedPhoto = localStorage.getItem(`profile-picture-${emailNormalizado}`);
    const foto = (storedPhoto && storedPhoto !== "") ? storedPhoto : "./img/defaultUser.png"; 
    if (mentorFotoElement) mentorFotoElement.src = foto;

    // Nome
    if (mentorNomeElement) mentorNomeElement.textContent = mentorData.nome || "Mentor(a) Indefinido";

    // Áreas
    const areas = mentorAreas.join(", ") || "Não informada";
    if (mentorAreaElement) mentorAreaElement.textContent = `Áreas: ${areas}`;

    // Disponibilidade
    let disponibilidadeTexto = "Indefinida";
    if (disp.dias.length > 0) {
        disponibilidadeTexto = `${disp.dias.join(", ")} — ${disp.horaInicio || '00:00'} às ${disp.horaFim || '23:59'}`;
    }
    if (mentorDispElement) mentorDispElement.textContent = `Disponibilidade: ${disponibilidadeTexto}`;
        
    // --- 4. LÓGICA DO CALENDÁRIO ---
    const diasDaSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const nomesDosMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    function isAvailableDay(date) {
        if (disp.dias.length === 0) return false;
        
        const dayIndex = date.getDay();
        const diaNomeBase = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"][dayIndex];

        const normalizedDispDays = disp.dias.map(day => day.trim().toLowerCase());
        const normalizedDiaNomeBase = diaNomeBase.toLowerCase();
        
        if (normalizedDispDays.includes(normalizedDiaNomeBase)) { return true; }
        const normalizedNomeComFeira = (diaNomeBase + "-feira").toLowerCase();
        if (normalizedDispDays.includes(normalizedNomeComFeira)) { return true; }
        const normalizedNomeCurto = diaNomeBase.substring(0, 3).toLowerCase();
        if (normalizedDispDays.some(day => day.startsWith(normalizedNomeCurto))) { return true; }

        return false;
    }

    function renderCalendar() {
        if (!calendarGrid || !monthYearDisplay) return;
        
        calendarGrid.innerHTML = '';
        monthYearDisplay.textContent = `${nomesDosMeses[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        diasDaSemana.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });

        const firstDayIndex = firstDayOfMonth.getDay();
        for (let i = 0; i < firstDayIndex; i++) {
            calendarGrid.appendChild(document.createElement('div'));
        }

        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'day-cell';
            dayCell.textContent = i;

            const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (dayDate < today) {
                dayCell.classList.add('past-day');
            } else if (isAvailableDay(dayDate)) {
                dayCell.classList.add('available-day');
                // Salva a data completa ISO (YYYY-MM-DD)
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

    // --- 5. LÓGICA DO MODAL E GERAÇÃO DE SLOTS ---

    function generateTimeSlots(startTimeStr, endTimeStr) {
        const slots = [];
        const slotDurationMinutes = 60; 
        
        const parseTime = (timeStr) => {
            if (!timeStr) return 0; 
            const [h, m] = timeStr.split(':').map(Number);
            return h * 60 + m;
        };
        
        let currentMinutes = parseTime(startTimeStr || "00:00");
        let endMinutes = parseTime(endTimeStr || "23:59");
        
        // Correção para horários noturnos/de madrugada
        if (endMinutes <= currentMinutes) {
            endMinutes += (24 * 60); 
        }
        
        while (currentMinutes < endMinutes) {
            if (currentMinutes + slotDurationMinutes <= endMinutes) {
                const hour = Math.floor(currentMinutes / 60) % 24; 
                const minute = currentMinutes % 60;
                
                const slotTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                slots.push(slotTime);
            }
            
            currentMinutes += slotDurationMinutes;
        }
        
        return slots;
    }

    function openScheduleModal(date) {
        // Exibição da data no modal
        const dateStr = date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
        if (selectedDateDisplay) selectedDateDisplay.textContent = `Agendar em: ${dateStr}`;
        if (horariosContainer) horariosContainer.innerHTML = '';
        
        const horaInicio = disp.horaInicio || "08:00";
        const horaFim = disp.horaFim || "18:00"; 

        const timeSlots = generateTimeSlots(horaInicio, horaFim);

        if (timeSlots.length === 0) {
            horariosContainer.innerHTML = '<p>Nenhum horário disponível neste dia.</p>';
            return;
        }

        // Obtém a data completa ISO (YYYY-MM-DD) para salvar no Local Storage
        const dateISO = date.toISOString().split('T')[0];

        timeSlots.forEach(slot => {
            const timeBtn = document.createElement('button');
            timeBtn.className = 'time-slot-btn';
            timeBtn.textContent = slot;
            // Passa a data ISO e o horário para a função de confirmação
            timeBtn.addEventListener('click', () => confirmarAgendamento(dateISO, slot)); 
            if (horariosContainer) horariosContainer.appendChild(timeBtn);
        });

        if (scheduleModal) scheduleModal.style.display = 'flex';
    }

    function confirmarAgendamento(dateISO, timeStr) {
        // 1. Salva o agendamento no Local Storage do estudante
        salvarAgendamentoParaEstudante(mentorData, dateISO, timeStr);

        // 2. Exibe o pop-up de confirmação
        if (popupConfirmacao) {
            popupConfirmacao.style.display = 'block';
            setTimeout(() => {
                popupConfirmacao.style.display = 'none';
            }, 3000);
        }

        if (scheduleModal) scheduleModal.style.display = 'none';
        
        console.log(`Agendamento confirmado e salvo para ${mentorData.nome} em ${dateISO} às ${timeStr}`);
    }

    // --- 6. EVENT LISTENERS ---
    prevMonthBtn?.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
    nextMonthBtn?.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });
    closeModalBtn?.addEventListener('click', () => { if (scheduleModal) scheduleModal.style.display = 'none'; });
    window.addEventListener('click', (event) => { if (event.target === scheduleModal) { if (scheduleModal) scheduleModal.style.display = 'none'; } });

    // --- 7. INICIAR RENDERIZAÇÃO ---
    if (mentorData) {
        renderCalendar();
    }
});