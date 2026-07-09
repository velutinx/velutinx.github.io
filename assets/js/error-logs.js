// error-logs.js – Central error logs viewer with Clear All
(function() {
    'use strict';

    const LOGGER_URL = 'https://error-logger.velutinx.workers.dev';

    const tbody = document.getElementById('logBody');
    const clearBtn = document.getElementById('clearBtn');
    const tabButton = document.getElementById('errorlogs-tab');

    // ─── Toast ──────────────────────────────────────────────────
    function showToast(msg, isError) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification' + (isError ? ' error' : '');
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(function() { toast.remove(); }, 3000);
    }

    // ─── Escape ──────────────────────────────────────────────────
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // ─── Render ──────────────────────────────────────────────────
    function renderLogs(logs) {
        if (!logs || logs.length === 0) {
            tbody.innerHTML = '<tr class="empty-row"><td colspan="5">✨ No errors logged yet.</td></tr>';
            updateTabVisibility(false);
            return;
        }

        let html = '';
        logs.forEach(function(log) {
            const time = log.received || log.timestamp || '—';
            const worker = log.worker || 'unknown';
            const error = log.error || '—';
            const url = log.url || '—';
            const stack = log.stack || '—';

            html += '<tr class="log-row">' +
                '<td class="time">' + escapeHtml(time) + '</td>' +
                '<td class="worker">' + escapeHtml(worker) + '</td>' +
                '<td class="error">' + escapeHtml(error) + '</td>' +
                '<td>' + escapeHtml(url) + '</td>' +
                '<td class="stack">' + escapeHtml(stack) + '</td>' +
                '</tr>';
        });
        tbody.innerHTML = html;
        updateTabVisibility(true);
    }

    // ─── Tab visibility ──────────────────────────────────────────
    function updateTabVisibility(hasItems) {
        if (!tabButton) return;
        tabButton.classList.toggle('has-items', hasItems);
    }

    // ─── Fetch logs ──────────────────────────────────────────────
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

    // ─── Clear All ────────────────────────────────────────────────
    function clearAll() {
        if (!confirm('⚠️ Delete ALL error logs from the database? This cannot be undone.')) {
            return;
        }

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
            fetchLogs(); // Refresh the table
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

    // ─── Init ──────────────────────────────────────────────────
    if (clearBtn) {
        clearBtn.addEventListener('click', clearAll);
    }

    fetchLogs();
})();
