// spreadsheet.js – Centralized Income & Expenses (Cloud Sync)
(function() {
    const WORKER_URL = 'https://spreadsheet-database.velutinx.workers.dev';
    const SUPABASE_URL = "https://knbvlyngmjaxndkiqggl.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuYnZseW5nbWpheG5ka2lxZ2dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MjI0NzEsImV4cCI6MjA4NjM5ODQ3MX0.mxthCDB6dCaHcEDMFN48pFnaJmcBbilXfP7tL-YAV08";

    let entries = [];
    window.entries = entries;

    let supabaseClient = null;
    let incomeChart = null;

    let monthSelect, daySelect, amountInput, currencySelect, categorySelect;
    let conceptInput, recurringCheck, addBtn, tableBody, exportBtn;

    const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    function formatDate(month, day, year = null) {
        const y = year || new Date().getFullYear();
        const m = monthNames[month];
        const d = String(day).padStart(2, '0');
        return `${m} ${d} ${y}`;
    }

    function populateDays() {
        daySelect.innerHTML = '';
        for (let d = 1; d <= 31; d++) {
            const opt = document.createElement('option');
            opt.value = d;
            opt.textContent = d;
            daySelect.appendChild(opt);
        }
    }

    function setDefaultDate() {
        const today = new Date();
        monthSelect.value = today.getMonth() + 1;
        populateDays();
        daySelect.value = today.getDate();
    }

    function updateConceptState() {
        if (categorySelect.value === 'Expenses') {
            conceptInput.disabled = false;
            conceptInput.placeholder = 'e.g. Railway subscription';
        } else {
            conceptInput.disabled = true;
            conceptInput.value = '';
            conceptInput.placeholder = '';
        }
    }

    // ---------- Server sync ----------
    async function fetchEntries() {
        try {
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Loading entries...</td></tr>`;
            const res = await fetch(`${WORKER_URL}/entries`);
            if (!res.ok) throw new Error('Server error');
            const data = await res.json();
            entries = data.map(e => ({
                id: e.id,
                month: e.month,
                day: e.day,
                amount: e.amount,
                currency: e.currency,
                category: e.category,
                concept: e.concept || '',
                recurring: Boolean(e.recurring)
            }));
        } catch (err) {
            console.error('Failed to fetch entries', err);
            showToast('⚠ Could not connect to server – working offline.', 'error');
            entries = [];
        }
        await ensurePastRecurringOccurrences();
        refreshAll();
    }

    async function addEntry(entryData) {
        const newEntry = {
            month: entryData.month,
            day: entryData.day,
            amount: entryData.amount,
            currency: entryData.currency,
            category: entryData.category,
            concept: entryData.concept || '',
            recurring: entryData.recurring || false
        };

        try {
            const res = await fetch(`${WORKER_URL}/entries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEntry)
            });
            if (!res.ok) throw new Error('Failed to save');
            const serverResp = await res.json();
            entries.push({ id: serverResp.id, ...newEntry });
            return true;
        } catch (err) {
            entries.push({ id: null, ...newEntry });
            showToast('Entry saved locally (server unreachable).', 'error');
            return false;
        }
    }

    // Enhanced delete: if deleting a recurring original, also remove all its auto-generated copies
    async function deleteEntry(index) {
        const entry = entries[index];
        const isRecurringOriginal = entry.category === 'Expenses' && entry.recurring;

        if (isRecurringOriginal) {
            // delete all auto‑generated copies (same concept, amount, day, but month > original month)
            const copies = entries.filter(e =>
                e.category === 'Expenses' &&
                !e.recurring &&
                e.concept === entry.concept &&
                e.amount === entry.amount &&
                e.day === entry.day &&
                e.month > entry.month
            );
            for (const copy of copies) {
                if (copy.id) {
                    await fetch(`${WORKER_URL}/entries/${copy.id}`, { method: 'DELETE' });
                }
                entries.splice(entries.indexOf(copy), 1);
            }
        }

        // delete the original entry itself
        if (entry.id) {
            try {
                await fetch(`${WORKER_URL}/entries/${entry.id}`, { method: 'DELETE' });
            } catch (err) {
                showToast('Could not delete from server.', 'error');
            }
        }
        entries.splice(index, 1);
        refreshAll();
        showToast('Entry removed.', 'info');
    }

    // Toggle recurring on the original entry (clicking ✔ on auto-generated will call cancelSubscription instead)
    async function toggleRecurring(index) {
        const entry = entries[index];
        const newRecurring = !entry.recurring;
        try {
            const res = await fetch(`${WORKER_URL}/entries/${entry.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recurring: newRecurring })
            });
            if (!res.ok) throw new Error('Failed to update');
            entry.recurring = newRecurring;
            refreshAll();
            showToast(`Recurring ${newRecurring ? 'enabled' : 'disabled'}.`, 'success');
        } catch (err) {
            showToast(`Could not toggle recurring: ${err.message}`, 'error');
        }
    }

    // Called when clicking ✔ on an auto-generated copy – cancels the whole subscription
    async function cancelSubscriptionFromAutoEntry(copyEntry) {
        // Find the original recurring entry (same concept, amount, day, recurring=true)
        const original = entries.find(e =>
            e.category === 'Expenses' &&
            e.recurring &&
            e.concept === copyEntry.concept &&
            e.amount === copyEntry.amount &&
            e.day === copyEntry.day
        );
        if (!original) {
            showToast('Original subscription not found.', 'error');
            return;
        }

        // Toggle the original's recurring off
        await toggleRecurring(entries.indexOf(original));

        // Delete the auto-generated copy that was clicked (the payment for that month never occurred)
        if (copyEntry.id) {
            await fetch(`${WORKER_URL}/entries/${copyEntry.id}`, { method: 'DELETE' });
            const idx = entries.indexOf(copyEntry);
            if (idx !== -1) entries.splice(idx, 1);
        }
        refreshAll();
        showToast('Subscription cancelled – this month’s charge removed.', 'success');
    }

    async function handleAddClick() {
        const month = parseInt(monthSelect.value);
        const day = parseInt(daySelect.value);
        const amount = parseFloat(amountInput.value);
        const currency = currencySelect.value;
        const category = categorySelect.value;
        const concept = conceptInput.value.trim();
        const recurring = recurringCheck.checked;

        if (isNaN(amount) || amount <= 0) {
            showToast('Please enter a valid positive amount.', 'error');
            return;
        }
        if (category === 'Expenses' && concept === '') {
            showToast('Please enter a description for the expense.', 'error');
            return;
        }

        const success = await addEntry({ month, day, amount, currency, category, concept, recurring });
        if (success) {
            amountInput.value = '';
            conceptInput.value = '';
            recurringCheck.checked = false;
            categorySelect.value = 'Expenses';
            updateConceptState();

            if (category === 'Expenses' && recurring) {
                await ensurePastRecurringOccurrences();
            }

            refreshAll();
            showToast('Entry added!', 'success');
        }
    }

    // ---------- Auto-fill missing past recurring occurrences ----------
    async function ensurePastRecurringOccurrences() {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;
        const currentDay = today.getDate();

        for (const e of entries) {
            if (e.category !== 'Expenses' || !e.recurring) continue;

            let month = e.month;
            let year = currentYear;
            while (true) {
                if (year > currentYear || (year === currentYear && month > currentMonth) ||
                    (year === currentYear && month === currentMonth && e.day >= currentDay)) {
                    break;
                }

                const exists = entries.some(ee =>
                    ee.month === month && ee.day === e.day &&
                    ee.category === 'Expenses' && ee.concept === e.concept &&
                    ee.amount === e.amount
                );

                if (!exists) {
                    await addEntry({
                        month, day: e.day,
                        amount: e.amount,
                        currency: e.currency,
                        category: 'Expenses',
                        concept: e.concept,
                        recurring: false
                    });
                }

                month++;
                if (month > 12) { month = 1; year++; }
            }
        }
    }

    // ---------- Helper: is this entry an auto‑generated past recurrence? ----------
    function isAutoGeneratedCopy(entry) {
        if (entry.category !== 'Expenses' || entry.recurring) return false;
        // Check if there is a recurring original with same concept, amount, day and earlier month
        return entries.some(e =>
            e.category === 'Expenses' &&
            e.recurring &&
            e.concept === entry.concept &&
            e.amount === entry.amount &&
            e.day === entry.day &&
            e.month < entry.month
        );
    }

    // ---------- Compute next occurrence for future projection ----------
    function getNextOccurrence(entry, currentYear, currentMonth, currentDay) {
        const today = new Date();
        let nextMonth = entry.month;
        let nextYear = currentYear;

        let dateCandidate = new Date(nextYear, nextMonth - 1, entry.day);
        while (dateCandidate <= today) {
            nextMonth++;
            if (nextMonth > 12) { nextMonth = 1; nextYear++; }
            dateCandidate = new Date(nextYear, nextMonth - 1, entry.day);
        }
        return { month: nextMonth, day: entry.day, year: nextYear };
    }

    // ---------- Website sync ----------
    const IMPORTED_IDS_KEY = 'imported_website_order_ids';
    function getImportedIds() { return JSON.parse(localStorage.getItem(IMPORTED_IDS_KEY) || '[]'); }
    function addImportedId(id) { /* ... unchanged ... */ }

    function buildWebsiteDescription(order) { /* ... unchanged ... */ }

    async function autoSyncWebsitePayments() { /* ... unchanged ... */ }

    // ---------- Patreon sync ----------
    const PATREON_PROXY = 'https://patreon-api-proxy.velutinx.workers.dev';
    const IMPORTED_PATREON_KEY = 'imported_patreon_charges';
    function getImportedPatreonCharges() { /* ... unchanged ... */ }
    function addImportedPatreonCharge(key) { /* ... unchanged ... */ }

    async function autoSyncPatreon() { /* ... unchanged ... */ }

    // ---------- Table rendering (updated) ----------
    function renderTable() {
        tableBody.innerHTML = '';
        if (entries.length === 0) {
            tableBody.innerHTML = `<tr class="empty-message"><td colspan="7">No entries yet. Add your first income/expense above.</td></tr>`;
            exportBtn.disabled = true;
            return;
        }

        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const currentDay = new Date().getDate();

        const allRows = [];
        entries.forEach(e => allRows.push({ entry: e, isFuture: false }));

        const recurringExpenses = entries.filter(e => e.category === 'Expenses' && e.recurring);
        recurringExpenses.forEach(e => {
            const next = getNextOccurrence(e, currentYear, currentMonth, currentDay);
            const exists = entries.some(ee =>
                ee.month === next.month && ee.day === next.day &&
                ee.category === 'Expenses' && ee.concept === e.concept &&
                ee.amount === e.amount
            );
            if (!exists) {
                allRows.push({
                    entry: { ...e, month: next.month, day: next.day, id: null, recurring: true, concept: e.concept, amount: e.amount, currency: e.currency, category: 'Expenses' },
                    isFuture: true
                });
            }
        });

        allRows.sort((a, b) => (a.entry.month * 100 + a.entry.day) - (b.entry.month * 100 + b.entry.day));

        const groups = new Map();
        for (const row of allRows) {
            const key = `${currentYear}-${row.entry.month}`;
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(row);
        }

        const sortedKeys = Array.from(groups.keys()).sort((a, b) => {
            const [y1, m1] = a.split('-').map(Number);
            const [y2, m2] = b.split('-').map(Number);
            return y1 - y2 || m1 - m2;
        });

        const futureMonths = new Set();
        allRows.forEach(r => { if (r.isFuture) futureMonths.add(`${currentYear}-${r.entry.month}`); });

        for (const key of sortedKeys) {
            const [y, m] = key.split('-').map(Number);
            const monthRows = groups.get(key);
            const actualEntries = monthRows.filter(r => !r.isFuture).map(r => r.entry);
            const monthTotal = actualEntries.reduce((sum, e) =>
                sum + (e.category === 'Expenses' ? -e.amount : e.amount), 0);
            const currencySet = new Set(actualEntries.map(e => e.currency));
            const currency = currencySet.size === 1 ? currencySet.values().next().value : 'mixed';
            const isCurrent = (y === currentYear && m === currentMonth);
            const monthName = monthNames[m] + ' ' + y;

            const headerTr = document.createElement('tr');
            headerTr.className = 'month-header';
            headerTr.dataset.monthKey = key;
            headerTr.innerHTML = `
                <td colspan="7" style="cursor:pointer;">
                    <span class="toggle-icon">${isCurrent ? '▼' : '▶'}</span>
                    <strong>${monthName}</strong> – ${actualEntries.length} entries, total:
                    <span style="color: ${monthTotal >= 0 ? '#4caf50' : '#f44336'}">
                        ${monthTotal.toFixed(2)} ${currency}
                    </span>
                    ${isCurrent ? ' (current)' : ''}
                    ${futureMonths.has(key) ? ' <span style="color:#888; font-size:0.8rem;">(upcoming)</span>' : ''}
                </td>
            `;
            tableBody.appendChild(headerTr);

            for (const row of monthRows) {
                const entry = row.entry;
                const dateStr = formatDate(entry.month, entry.day, y);
                const amountDisplay = entry.amount.toFixed(2);
                const desc = entry.concept || '';

                let recurringHtml = '';
                if (entry.category === 'Expenses') {
                    if (row.isFuture) {
                        recurringHtml = `<span style="color:#888; font-weight:bold;">⏳</span>`;
                    } else {
                        const isAutoCopy = isAutoGeneratedCopy(entry);
                        if (isAutoCopy) {
                            // Clickable ✔ that calls cancelSubscriptionFromAutoEntry
                            recurringHtml = `<span class="auto-recurring-toggle" data-month="${entry.month}" data-day="${entry.day}" data-concept="${entry.concept}" data-amount="${entry.amount}" style="color:#4caf50; cursor:pointer; font-weight:bold;">✔</span>`;
                        } else {
                            const icon = entry.recurring ? '✔' : '✕';
                            const color = entry.recurring ? '#4caf50' : '#f44336';
                            recurringHtml = `<span class="recurring-toggle" data-index="${entries.indexOf(entry)}" style="color:${color}; cursor:pointer; font-weight:bold;">${icon}</span>`;
                        }
                    }
                }

                // For auto-generated copies, no delete button
                const deleteHtml = (entry.category === 'Expenses' && !row.isFuture && !isAutoGeneratedCopy(entry))
                    ? `<button class="delete-btn" data-index="${entries.indexOf(entry)}" title="Delete">✕</button>`
                    : '';

                const rowClass = 'entry-row ' +
                    (isCurrent || futureMonths.has(key) ? '' : 'hidden-row ') +
                    (entry.category === 'Expenses' ? 'row-expense' : 'row-income') +
                    (row.isFuture ? ' future-row' : '');

                const tr = document.createElement('tr');
                tr.className = rowClass;
                tr.dataset.monthKey = key;
                if (row.isFuture) {
                    tr.style.opacity = '0.5';
                    tr.style.fontStyle = 'italic';
                }
                tr.innerHTML = `
                    <td>${dateStr}</td>
                    <td>${amountDisplay}</td>
                    <td>${entry.currency}</td>
                    <td>${entry.category}</td>
                    <td>${desc}</td>
                    <td>${recurringHtml}</td>
                    <td>${deleteHtml}</td>
                `;
                tableBody.appendChild(tr);
            }
        }

        // Attach events
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.dataset.index);
                deleteEntry(idx);
            });
        });

        document.querySelectorAll('.recurring-toggle').forEach(span => {
            span.addEventListener('click', function(e) {
                e.stopPropagation();
                const idx = parseInt(this.dataset.index);
                toggleRecurring(idx);
            });
        });

        document.querySelectorAll('.auto-recurring-toggle').forEach(span => {
            span.addEventListener('click', function(e) {
                e.stopPropagation();
                const concept = this.dataset.concept;
                const amount = parseFloat(this.dataset.amount);
                const day = parseInt(this.dataset.day);
                const month = parseInt(this.dataset.month);
                const copyEntry = entries.find(ee =>
                    ee.concept === concept && ee.amount === amount && ee.day === day && ee.month === month && !ee.recurring
                );
                if (copyEntry) {
                    cancelSubscriptionFromAutoEntry(copyEntry);
                }
            });
        });

        document.querySelectorAll('.month-header').forEach(header => {
            header.addEventListener('click', function() {
                const monthKey = this.dataset.monthKey;
                const icon = this.querySelector('.toggle-icon');
                const isOpen = icon.textContent.trim() === '▼';
                icon.textContent = isOpen ? '▶' : '▼';
                document.querySelectorAll(`.entry-row[data-month-key="${monthKey}"]`).forEach(row => {
                    row.classList.toggle('hidden-row', isOpen);
                });
            });
        });

        exportBtn.disabled = false;
    }

    // ---------- Chart (recurring no reset, non-recurring monthly reset) ----------
    function buildChart(initialDays) {
        if (incomeChart) {
            incomeChart.destroy();
            incomeChart = null;
        }
        if (entries.length === 0) return;

        const currentYear = new Date().getFullYear();
        const now = moment().endOf('day');
        const startDate = moment().subtract(initialDays - 1, 'days').startOf('day');

        // Separate recurring and non-recurring expenses
        const recurringExpenses = entries.filter(e => e.category === 'Expenses' && e.recurring);
        const nonRecurringExpenses = entries.filter(e => e.category === 'Expenses' && !e.recurring);

        // Map for daily amounts of each category
        const dailyMap = new Map();

        // Add income categories
        entries.forEach(e => {
            const date = moment(new Date(currentYear, e.month - 1, e.day)).format('YYYY-MM-DD');
            if (!dailyMap.has(date)) {
                dailyMap.set(date, { patreon: 0, website: 0, kofi: 0, nonRecExp: 0, recExp: 0 });
            }
            const d = dailyMap.get(date);
            if (e.category === 'Patreon subscription') d.patreon += e.amount;
            else if (e.category === 'Website payments') d.website += e.amount;
            else if (e.category === 'Ko-Fi subscriptions') d.kofi += e.amount;
            else if (e.category === 'Expenses') {
                if (e.recurring) d.recExp += e.amount;
                else d.nonRecExp += e.amount;
            }
        });

        // We'll compute cumulative lines: 
        // - patreon, website, kofi reset monthly
        // - nonRecExp reset monthly
        // - recExp never resets (global cumulative)
        const dates = [], patreonCum = [], websiteCum = [], kofiCum = [], nonRecExpCum = [], recExpCumGlobal = [], totalExpCum = [], netCum = [];
        let curPatreon = 0, curWebsite = 0, curKofi = 0, curNonRecExp = 0, globalRecExp = 0;
        let lastMonth = null;

        for (let d = moment(startDate); d.isSameOrBefore(now, 'day'); d.add(1, 'day')) {
            const key = d.format('YYYY-MM-DD');
            const month = d.month() + 1;

            if (lastMonth !== null && month !== lastMonth) {
                curPatreon = 0; curWebsite = 0; curKofi = 0; curNonRecExp = 0;
            }
            lastMonth = month;

            const today = dailyMap.get(key) || { patreon: 0, website: 0, kofi: 0, nonRecExp: 0, recExp: 0 };
            curPatreon += today.patreon;
            curWebsite += today.website;
            curKofi += today.kofi;
            curNonRecExp += today.nonRecExp;
            globalRecExp += today.recExp;   // never reset

            const totalExp = curNonRecExp + globalRecExp;
            const net = curPatreon + curWebsite + curKofi - totalExp;

            dates.push(d.toDate());
            patreonCum.push(curPatreon);
            websiteCum.push(curWebsite);
            kofiCum.push(curKofi);
            nonRecExpCum.push(curNonRecExp);
            recExpCumGlobal.push(globalRecExp);
            totalExpCum.push(totalExp);
            netCum.push(net);
        }

        const ctx = document.getElementById('incomeChart').getContext('2d');
        incomeChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [
                    { label: 'Patreon', data: dates.map((d, i) => ({ x: d, y: patreonCum[i] })), borderColor: '#3b82f6', borderWidth: 2, pointRadius: 0, pointHoverRadius: 3, tension: 0 },
                    { label: 'Website', data: dates.map((d, i) => ({ x: d, y: websiteCum[i] })), borderColor: '#f97316', borderWidth: 2, pointRadius: 0, pointHoverRadius: 3, tension: 0 },
                    { label: 'Ko‑fi', data: dates.map((d, i) => ({ x: d, y: kofiCum[i] })), borderColor: '#eab308', borderWidth: 2, pointRadius: 0, pointHoverRadius: 3, tension: 0 },
                    { label: 'Expenses (abs)', data: dates.map((d, i) => ({ x: d, y: totalExpCum[i] })), borderColor: '#ef4444', borderWidth: 2, pointRadius: 0, pointHoverRadius: 3, tension: 0 },
                    { label: 'Net Income', data: dates.map((d, i) => ({ x: d, y: netCum[i] })), borderColor: '#22c55e', borderWidth: 3, pointRadius: 0, pointHoverRadius: 3, tension: 0 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'nearest', axis: 'x', intersect: false },
                plugins: {
                    legend: { labels: { color: '#aaa' } },
                    zoom: {
                        zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' },
                        pan: { enabled: true, mode: 'x' },
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: { unit: 'day', displayFormats: { day: 'MMM D' } },
                        min: startDate.toDate(),
                        max: now.toDate(),
                        ticks: { color: '#aaa', maxRotation: 45 },
                        grid: { color: '#2a2f38' }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#aaa', callback: v => '$' + v },
                        grid: { color: '#2a2f38' }
                    }
                }
            }
        });
    }

    function refreshAll() {
        renderTable();
        const activeBtn = document.querySelector('.range-btn.active');
        const days = activeBtn ? parseInt(activeBtn.dataset.days) : 30;
        buildChart(days);
    }

    function setupRangeButtons() {
        document.querySelectorAll('.range-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                buildChart(parseInt(this.dataset.days));
            });
        });
    }

    function exportToExcel() {
        if (entries.length === 0) return;
        const data = entries.map(e => ({
            Date: formatDate(e.month, e.day),
            Amount: e.category === 'Expenses' ? -e.amount : e.amount,
            Currency: e.currency,
            Category: e.category,
            Description: e.concept || '',
            Recurring: e.recurring ? 'Yes' : 'No'
        }));
        const ws = XLSX.utils.json_to_sheet(data, { header: ['Date','Amount','Currency','Category','Description','Recurring'] });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Income & Expenses');
        XLSX.writeFile(wb, 'income_expenses.xlsx');
        showToast('Excel downloaded!', 'success');
    }

    function showToast(msg, type='success') {
        let toast = document.getElementById('liveToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'liveToast';
            toast.className = 'toast-notification';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.className = `toast-notification ${type} show`;
        setTimeout(() => toast.classList.remove('show'), 2500);
    }

    // ---------- Init ----------
    document.addEventListener('DOMContentLoaded', async () => {
        monthSelect = document.getElementById('monthSelect');
        daySelect = document.getElementById('daySelect');
        amountInput = document.getElementById('amountInput');
        currencySelect = document.getElementById('currencySelect');
        categorySelect = document.getElementById('categorySelect');
        conceptInput = document.getElementById('conceptInput');
        recurringCheck = document.getElementById('recurringCheck');
        addBtn = document.getElementById('addEntryBtn');
        tableBody = document.getElementById('tableBody');
        exportBtn = document.getElementById('exportBtn');

        if (typeof supabase === 'undefined') {
            showToast('Supabase library missing – auto‑sync disabled.', 'error');
            supabaseClient = null;
        } else {
            supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
        }

        setDefaultDate();
        updateConceptState();

        categorySelect.addEventListener('change', updateConceptState);
        addBtn.addEventListener('click', handleAddClick);
        exportBtn.addEventListener('click', exportToExcel);
        setupRangeButtons();

        await fetchEntries();
        await autoSyncWebsitePayments();
        await autoSyncPatreon();

        buildChart(30);
    });
})();
