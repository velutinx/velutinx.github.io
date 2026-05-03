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

    async function deleteEntry(index) {
        const entry = entries[index];
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

    // Toggle recurring on the original entry (✔ ↔ ✕)
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
            // If turning off, we don't delete copies; they will just become inactive in the table.
            // If turning on, ensure past copies exist (they should already be present, but just in case).
            if (newRecurring) {
                await ensurePastRecurringOccurrences();
            }
            refreshAll();
            showToast(`Recurring ${newRecurring ? 'enabled' : 'disabled'}.`, 'success');
        } catch (err) {
            showToast(`Could not toggle recurring: ${err.message}`, 'error');
        }
    }

    // Cancel subscription from an auto-generated copy (set original recurring=false)
    async function cancelSubscriptionFromCopy(copyEntry) {
        const original = entries.find(e =>
            e.category === 'Expenses' && e.recurring &&
            e.concept === copyEntry.concept && e.amount === copyEntry.amount && e.day === copyEntry.day
        );
        if (!original) {
            showToast('Original subscription not found.', 'error');
            return;
        }
        await toggleRecurring(entries.indexOf(original));
    }

    // Reactivate subscription from an inactive copy (set original recurring=true)
    async function reactivateSubscriptionFromCopy(copyEntry) {
        const original = entries.find(e =>
            e.category === 'Expenses' && !e.recurring &&   // original is currently inactive
            e.concept === copyEntry.concept && e.amount === copyEntry.amount && e.day === copyEntry.day
        );
        if (!original) {
            showToast('Original subscription not found (maybe already active).', 'error');
            return;
        }
        // Toggle it on
        await toggleRecurring(entries.indexOf(original));
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
            let year = currentYear; // assume same year (can be extended later)
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
                        recurring: false   // auto-generated copies are non-recurring
                    });
                }

                month++;
                if (month > 12) { month = 1; year++; }
            }
        }
    }

    // ---------- Determine if an entry is an auto-generated copy and its subscription status ----------
    function getCopyInfo(entry) {
        if (entry.category !== 'Expenses' || entry.recurring) return null;
        // Find the original recurring entry with same concept, amount, day
        const original = entries.find(e =>
            e.category === 'Expenses' && e.recurring &&
            e.concept === entry.concept && e.amount === entry.amount && e.day === entry.day
        );
        if (!original) return null; // no original found (shouldn't happen)
        return {
            isCopy: true,
            active: original.recurring   // true if original is still recurring
        };
    }

    // Check if an entry is an inactive copy (original exists but inactive)
    function isInactiveCopy(entry) {
        const info = getCopyInfo(entry);
        return info && !info.active;
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
    function addImportedId(id) { /* unchanged */ }
    function buildWebsiteDescription(order) { /* unchanged */ }
    async function autoSyncWebsitePayments() { /* unchanged */ }

    // ---------- Patreon sync ----------
    const PATREON_PROXY = 'https://patreon-api-proxy.velutinx.workers.dev';
    const IMPORTED_PATREON_KEY = 'imported_patreon_charges';
    function getImportedPatreonCharges() { /* unchanged */ }
    function addImportedPatreonCharge(key) { /* unchanged */ }
    async function autoSyncPatreon() { /* unchanged */ }

    // ---------- Table rendering ----------
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

        // Build all rows: actual entries + future projections
        const allRows = [];
        entries.forEach(e => allRows.push({ entry: e, isFuture: false }));

        const recurringExpenses = entries.filter(e => e.category === 'Expenses' && e.recurring);
        recurringExpenses.forEach(e => {
            // Only add future projection if the original is still active
            if (!e.recurring) return;
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

        // Group by month (including future months)
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
            // For month total, exclude future rows and inactive copies
            const activeActualEntries = monthRows.filter(r => !r.isFuture).map(r => r.entry).filter(e => !isInactiveCopy(e));
            const monthTotal = activeActualEntries.reduce((sum, e) =>
                sum + (e.category === 'Expenses' ? -e.amount : e.amount), 0);
            const currencySet = new Set(activeActualEntries.map(e => e.currency));
            const currency = currencySet.size === 1 ? currencySet.values().next().value : 'mixed';
            const isCurrent = (y === currentYear && m === currentMonth);
            const monthName = monthNames[m] + ' ' + y;

            // Determine if this month contains any future projection
            const hasFuture = monthRows.some(r => r.isFuture);
            // Determine if this month contains an inactive copy
            const hasInactive = monthRows.some(r => !r.isFuture && isInactiveCopy(r.entry));

            const headerTr = document.createElement('tr');
            headerTr.className = 'month-header';
            headerTr.dataset.monthKey = key;
            headerTr.innerHTML = `
                <td colspan="7" style="cursor:pointer;">
                    <span class="toggle-icon">${isCurrent ? '▼' : '▶'}</span>
                    <strong>${monthName}</strong> – ${monthRows.filter(r => !r.isFuture).length} entries, total:
                    <span style="color: ${monthTotal >= 0 ? '#4caf50' : '#f44336'}">
                        ${monthTotal.toFixed(2)} ${currency}
                    </span>
                    ${isCurrent ? ' (current)' : ''}
                    ${hasFuture ? ' <span style="color:#888; font-size:0.8rem;">(upcoming)</span>' : ''}
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
                        // Future projection based on original's active status
                        const original = entries.find(e => e.recurring && e.concept === entry.concept && e.amount === entry.amount && e.day === entry.day);
                        const isActive = original ? original.recurring : false;
                        recurringHtml = isActive
                            ? `<span style="color:#888; font-weight:bold;">⏳</span>`
                            : `<span style="color:#f44336; font-weight:bold;">✕</span>`;
                    } else {
                        const copyInfo = getCopyInfo(entry);
                        if (copyInfo) {
                            // This is an auto-generated copy
                            const active = copyInfo.active;
                            const icon = active ? '✔' : '✕';
                            const color = active ? '#4caf50' : '#f44336';
                            // Click handler will be attached later via class 'copy-recurring-toggle'
                            recurringHtml = `<span class="copy-recurring-toggle" data-concept="${entry.concept}" data-amount="${entry.amount}" data-day="${entry.day}" data-month="${entry.month}" style="color:${color}; cursor:pointer; font-weight:bold;">${icon}</span>`;
                        } else {
                            // Original recurring entry or one-time expense
                            const icon = entry.recurring ? '✔' : '✕';
                            const color = entry.recurring ? '#4caf50' : '#f44336';
                            const toggleClass = entry.recurring ? 'recurring-toggle' : 'recurring-toggle'; // allow toggle only on original? actually both original and one-time can toggle, so keep same.
                            recurringHtml = `<span class="recurring-toggle" data-index="${entries.indexOf(entry)}" style="color:${color}; cursor:pointer; font-weight:bold;">${icon}</span>`;
                        }
                    }
                }

                // Delete button: only for original recurring expenses (or one-time expenses) but not for copies
                const isOriginalRecurring = entry.category === 'Expenses' && entry.recurring;
                const isOneTimeExpense = entry.category === 'Expenses' && !entry.recurring && !getCopyInfo(entry); // not a copy
                const deleteHtml = (!row.isFuture && (isOriginalRecurring || isOneTimeExpense))
                    ? `<button class="delete-btn" data-index="${entries.indexOf(entry)}" title="Delete">✕</button>`
                    : '';

                // Determine row styling
                let rowClass = 'entry-row ';
                if (isCurrent || futureMonths.has(key)) rowClass += '';
                else rowClass += 'hidden-row ';
                rowClass += (entry.category === 'Expenses' ? 'row-expense' : 'row-income');
                if (row.isFuture) rowClass += ' future-row';

                const tr = document.createElement('tr');
                tr.className = rowClass;
                tr.dataset.monthKey = key;
                if (row.isFuture) {
                    tr.style.opacity = '0.5';
                    tr.style.fontStyle = 'italic';
                } else if (isInactiveCopy(entry)) {
                    tr.style.opacity = '0.5';
                    tr.style.color = '#888';
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

        // Attach event listeners
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.dataset.index);
                deleteEntry(idx);
            });
        });

        // Toggle original recurring (on the original entry)
        document.querySelectorAll('.recurring-toggle').forEach(span => {
            span.addEventListener('click', function(e) {
                e.stopPropagation();
                const idx = parseInt(this.dataset.index);
                toggleRecurring(idx);
            });
        });

        // Cancel or reactivate subscription from a copy
        document.querySelectorAll('.copy-recurring-toggle').forEach(span => {
            span.addEventListener('click', function(e) {
                e.stopPropagation();
                const concept = this.dataset.concept;
                const amount = parseFloat(this.dataset.amount);
                const day = parseInt(this.dataset.day);
                const month = parseInt(this.dataset.month);
                const copyEntry = entries.find(ee =>
                    ee.concept === concept && ee.amount === amount && ee.day === day && ee.month === month && !ee.recurring
                );
                if (!copyEntry) return;
                const copyInfo = getCopyInfo(copyEntry);
                if (!copyInfo) return;
                if (copyInfo.active) {
                    // Currently active -> cancel
                    cancelSubscriptionFromCopy(copyEntry);
                } else {
                    // Currently inactive -> reactivate
                    reactivateSubscriptionFromCopy(copyEntry);
                }
            });
        });

        // Month toggle
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

// ---------- Chart (fixed: handles cancellation drop dates and monthly resets) ----------
function buildChart(initialDays) {
    if (incomeChart) {
        incomeChart.destroy();
        incomeChart = null;
    }
    if (entries.length === 0) return;

    const currentYear = new Date().getFullYear();
    const now = moment().endOf('day');
    const startDate = moment().subtract(initialDays - 1, 'days').startOf('day');

    // 1. IDENTIFY RECURRING SOURCES (Originals)
    const activeRecurringOriginals = entries.filter(e => e.category === 'Expenses' && e.recurring);

    // 2. IDENTIFY CANCELLATION DATES (The exact day it turns to ✕)
    const cancellationMap = new Map();
    entries.forEach(e => {
        const info = typeof getCopyInfo === 'function' ? getCopyInfo(e) : null;
        // If this row is a copy and it is marked INACTIVE (✕)
        if (info && !info.active) {
            const dateStr = moment(new Date(currentYear, e.month - 1, e.day)).format('YYYY-MM-DD');
            // If we find multiple cancellations, we take the earliest one
            if (!cancellationMap.has(info.originalId) || dateStr < cancellationMap.get(info.originalId)) {
                cancellationMap.set(info.originalId, dateStr);
            }
        }
    });

    // 3. GET GENUINE ONE-TIME ENTRIES ONLY
    const nonRecurringEntries = entries.filter(e => {
        if (e.category !== 'Expenses') return true; // Keep Income
        if (e.recurring) return false;              // Handled by baseline logic

        // CRITICAL: If this row is a copy (active OR canceled), EXCLUDE it from 
        // the monthly accumulator. This prevents the "April 5th" lingering bug.
        const copyInfo = typeof getCopyInfo === 'function' ? getCopyInfo(e) : null;
        if (copyInfo) return false; 

        return true; // Only genuine one-off expenses (like a one-time hardware buy)
    });

    // 4. BUILD DAILY MAP FOR MONTHLY ACCUMULATORS
    const dailyNonRecMap = new Map();
    nonRecurringEntries.forEach(e => {
        const date = moment(new Date(currentYear, e.month - 1, e.day)).format('YYYY-MM-DD');
        if (!dailyNonRecMap.has(date)) {
            dailyNonRecMap.set(date, { patreon: 0, website: 0, kofi: 0, expense: 0 });
        }
        const d = dailyNonRecMap.get(date);
        if (e.category === 'Patreon subscription') d.patreon += e.amount;
        else if (e.category === 'Website payments') d.website += e.amount;
        else if (e.category === 'Ko-Fi subscriptions') d.kofi += e.amount;
        else if (e.category === 'Expenses') d.expense += e.amount;
    });

    // 5. BUILD CUMULATIVE ARRAYS
    const dates = [], patreonCum = [], websiteCum = [], kofiCum = [],
          totalExpCum = [], netCum = [];

    let curPatreon = 0, curWebsite = 0, curKofi = 0, curNonRecExp = 0;
    let lastMonth = null;

    for (let d = moment(startDate); d.isSameOrBefore(now, 'day'); d.add(1, 'day')) {
        const key = d.format('YYYY-MM-DD');
        const month = d.month() + 1;

        // Reset monthly variables on the 1st
        if (lastMonth !== null && month !== lastMonth) {
            curPatreon = 0; curWebsite = 0; curKofi = 0; curNonRecExp = 0;
        }
        lastMonth = month;

        const nonRec = dailyNonRecMap.get(key) || { patreon: 0, website: 0, kofi: 0, expense: 0 };
        curPatreon += nonRec.patreon;
        curWebsite += nonRec.website;
        curKofi += nonRec.kofi;
        curNonRecExp += nonRec.expense;

        // 6. CALCULATE FLAT BASELINE (DROPS TO 0 ON CANCELLATION DATE)
        let currentRunRate = 0;
        activeRecurringOriginals.forEach(ori => {
            const startKey = moment(new Date(currentYear, ori.month - 1, ori.day)).format('YYYY-MM-DD');
            const cancelKey = cancellationMap.get(ori.id);

            // Logic: Is today >= the day the subscription started?
            if (key >= startKey) {
                // AND is today strictly BEFORE the day it was canceled?
                if (!cancelKey || key < cancelKey) {
                    currentRunRate += ori.amount;
                }
            }
        });

        const totalExp = curNonRecExp + currentRunRate;
        const totalIncome = curPatreon + curWebsite + curKofi;
        const net = totalIncome - totalExp;

        dates.push(d.toDate());
        patreonCum.push(curPatreon);
        websiteCum.push(curWebsite);
        kofiCum.push(curKofi);
        totalExpCum.push(totalExp);
        netCum.push(net);
    }

    // 7. RENDER CHART
    const ctx = document.getElementById('incomeChart').getContext('2d');
    incomeChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                { label: 'Patreon', data: dates.map((d, i) => ({ x: d, y: patreonCum[i] })), borderColor: '#3b82f6', borderWidth: 2, pointRadius: 0, tension: 0 },
                { label: 'Website', data: dates.map((d, i) => ({ x: d, y: websiteCum[i] })), borderColor: '#f97316', borderWidth: 2, pointRadius: 0, tension: 0 },
                { label: 'Ko-fi', data: dates.map((d, i) => ({ x: d, y: kofiCum[i] })), borderColor: '#eab308', borderWidth: 2, pointRadius: 0, tension: 0 },
                { label: 'Expenses (abs)', data: dates.map((d, i) => ({ x: d, y: totalExpCum[i] })), borderColor: '#ef4444', borderWidth: 2, pointRadius: 0, tension: 0 },
                { label: 'Net Income', data: dates.map((d, i) => ({ x: d, y: netCum[i] })), borderColor: '#22c55e', borderWidth: 3, pointRadius: 0, tension: 0 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'nearest', axis: 'x', intersect: false },
            scales: {
                x: {
                    type: 'time',
                    time: { unit: 'day', displayFormats: { day: 'MMM D' } },
                    ticks: { color: '#aaa' },
                    grid: { color: '#2a2f38' }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: '#aaa', callback: v => '$' + v },
                    grid: { color: '#2a2f38' }
                }
            },
            plugins: { legend: { labels: { color: '#aaa' } } }
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
