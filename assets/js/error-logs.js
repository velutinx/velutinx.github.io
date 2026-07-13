//     velutinx.github.io/assets/js/error-logs.js

(function() {
    'use strict';

    const LOGGER_URL = 'https://error-logger.velutinx.workers.dev';

    const tbody = document.getElementById('logBody');
    const clearBtn = document.getElementById('clearBtn');
    const tabButton = document.getElementById('errorlogs-tab');

    function formatLocalTime(utcString) {
        if (!utcString) return '—';
        try {
            const d = new Date(utcString);
            return d.toLocaleString('en-US', {
                timeZone: 'America/Hermosillo',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
        } catch {
            return utcString;
        }
    }

    function showToast(msg, isError) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification' + (isError ? ' error' : '');
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(function() { toast.remove(); }, 3000);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function groupLogs(logs) {
        const groups = new Map();

        logs.forEach(log => {
            const key = JSON.stringify({
                worker: log.worker || 'unknown',
                error: log.error || '',
                stack: log.stack || '',
                url: log.url || '',
                method: log.method || ''
            });

            if (!groups.has(key)) {
                groups.set(key, {
                    worker: log.worker || 'unknown',
                    error: log.error || '',
                    stack: log.stack || '',
                    url: log.url || '',
                    method: log.method || '',
                    occurrences: []
                });
            }
            groups.get(key).occurrences.push({
                timestamp: log.timestamp || log.received || '—',
                received: log.received || log.timestamp || '—',
                id: log.id,
                context: log.context || null  // <-- store context
            });
        });

        const sortedGroups = Array.from(groups.values());
        sortedGroups.sort((a, b) => {
            const aLatest = a.occurrences.reduce((max, o) => o.timestamp > max ? o.timestamp : max, '');
            const bLatest = b.occurrences.reduce((max, o) => o.timestamp > max ? o.timestamp : max, '');
            return bLatest.localeCompare(aLatest);
        });

        return sortedGroups;
    }

    function renderLogs(logs) {
        if (!logs || logs.length === 0) {
            tbody.innerHTML = '<tr class="empty-row"><td colspan="5">✨ No errors logged yet.</td></tr>';
            updateTabVisibility(false);
            return;
        }

        const groups = groupLogs(logs);
        let html = '';

        groups.forEach((group, index) => {
            const count = group.occurrences.length;
            const latestTime = formatLocalTime(group.occurrences[0].timestamp) || '—';
            const worker = group.worker;
            const error = group.error;
            const url = group.url || '—';
            const stack = group.stack || '—';

            html += `
                <tr class="group-row" data-group="${index}">
                    <td class="time">${escapeHtml(latestTime)}</td>
                    <td class="worker">${escapeHtml(worker)}</td>
                    <td class="error">${escapeHtml(error)}</td>
                    <td>${escapeHtml(url)}</td>
                    <td>
                        <span class="group-toggle" data-group="${index}">
                            <span class="toggle-icon">▶</span> ${count} occurrence${count > 1 ? 's' : ''}
                        </span>
                    </td>
                </tr>
                <tr class="group-detail" data-group="${index}" style="display:none;">
                    <td colspan="5">
                        <div style="background: #0a0e14; border-radius: 8px; padding: 8px; margin: 4px 0;">
                            <table style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                                <thead>
                                    <tr>
                                        <th style="text-align:left; padding:4px 8px; color:#888;">Timestamp (Sonora)</th>
                                        <th style="text-align:left; padding:4px 8px; color:#888;">Received (Sonora)</th>
                                        <th style="text-align:left; padding:4px 8px; color:#888;">Stack</th>
                                        <th style="text-align:left; padding:4px 8px; color:#888;">Context (click to expand)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${group.occurrences.map(occ => {
                                        let contextHtml = '—';
                                        if (occ.context) {
                                            try {
                                                const ctxObj = JSON.parse(occ.context);
                                                const pretty = JSON.stringify(ctxObj, null, 2);
                                                contextHtml = `<span style="cursor:pointer; color:#60a5fa; text-decoration:underline;" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'block' ? 'none' : 'block'">▼ show</span><pre style="display:none; background:#0f131a; padding:6px; border-radius:4px; font-size:0.7rem; max-height:200px; overflow:auto; white-space:pre-wrap; word-break:break-all;">${escapeHtml(pretty)}</pre>`;
                                            } catch (e) {
                                                contextHtml = escapeHtml(occ.context);
                                            }
                                        }
                                        return `
                                        <tr>
                                            <td style="padding:4px 8px; color:#ddd;">${escapeHtml(formatLocalTime(occ.timestamp))}</td>
                                            <td style="padding:4px 8px; color:#ddd;">${escapeHtml(formatLocalTime(occ.received))}</td>
                                            <td style="padding:4px 8px; color:#aaa; font-family:monospace; font-size:0.7rem; word-break:break-word;">${escapeHtml(stack)}</td>
                                            <td style="padding:4px 8px;">${contextHtml}</td>
                                        </tr>
                                    `}).join('')}
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;

        document.querySelectorAll('.group-toggle').forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                const groupIndex = this.dataset.group;
                const detailRow = document.querySelector(`tr.group-detail[data-group="${groupIndex}"]`);
                const icon = this.querySelector('.toggle-icon');
                if (detailRow.style.display === 'none') {
                    detailRow.style.display = 'table-row';
                    icon.textContent = '▼';
                } else {
                    detailRow.style.display = 'none';
                    icon.textContent = '▶';
                }
                e.stopPropagation();
            });
        });

        document.querySelectorAll('.group-row').forEach(row => {
            row.addEventListener('click', function() {
                const toggle = this.querySelector('.group-toggle');
                if (toggle) toggle.click();
            });
        });

        updateTabVisibility(true);
    }

    function updateTabVisibility(hasItems) {
        if (!tabButton) return;
        tabButton.classList.toggle('has-items', hasItems);
    }

    function fetchLogs() {
        fetch(LOGGER_URL + '/logs')
            .then(function(res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(function(logs) {
                renderLogs(logs);
            })
            .catch(function(err) {
                console.error('Fetch error:', err);
                tbody.innerHTML = '<tr class="empty-row"><td colspan="5">❌ Failed to load logs: ' + escapeHtml(err.message) + '</td></tr>';
                updateTabVisibility(false);
            });
    }

    function clearAll() {
        clearBtn.disabled = true;
        clearBtn.textContent = '⏳ Clearing...';

        fetch(LOGGER_URL + '/logs', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        })
        .then(function(res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        })
        .then(function(data) {
            showToast('🗑️ All logs cleared from database.', false);
            fetchLogs();
        })
        .catch(function(err) {
            console.error('Clear error:', err);
            showToast('❌ Failed to clear logs: ' + err.message, true);
        })
        .finally(function() {
            clearBtn.disabled = false;
            clearBtn.textContent = '🗑️ Clear All';
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', clearAll);
    }

    fetchLogs();

    setInterval(function() {
        if (!document.hidden) {
            fetchLogs();
        }
    }, 10000);
})();
