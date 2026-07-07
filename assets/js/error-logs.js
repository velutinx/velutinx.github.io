// error-logs.js – Central error logs viewer
(function() {
    'use strict';

    const LOGGER_URL = 'https://error-logger.velutinx.workers.dev';
    const SEEN_IDS_KEY = 'error_logs_seen_ids';

    const tbody = document.getElementById('logBody');
    const muteBtn = document.getElementById('muteBtn');

    // ─── Toast (same pattern as helper page) ──────────────────
    function showToast(msg, isError) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification' + (isError ? ' error' : '');
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(function() { toast.remove(); }, 3000);
    }

    // ─── Seen IDs as a Set ──────────────────────────────────────
    function getSeenIds() {
        try {
            const raw = localStorage.getItem(SEEN_IDS_KEY);
            return raw ? new Set(JSON.parse(raw)) : new Set();
        } catch {
            return new Set();
        }
    }

    function saveSeenIds(set) {
        localStorage.setItem(SEEN_IDS_KEY, JSON.stringify([...set]));
    }

    function addSeenIds(newIds) {
        const set = getSeenIds();
        newIds.forEach(function(id) { set.add(id); });
        saveSeenIds(set);
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

    // ─── Render ──────────────────────────────────────────────────
    function renderLogs(logs) {
        const seenIds = getSeenIds();

        if (!logs || logs.length === 0) {
            tbody.innerHTML = '<tr class="empty-row"><td colspan="5">✨ No errors logged yet.</td></tr>';
            return;
        }

        var html = '';
        logs.forEach(function(log) {
            var id = log.id !== undefined && log.id !== null ? String(log.id) : '';
            var isMuted = seenIds.has(id);
            var time = log.received || log.timestamp || '—';
            var worker = log.worker || 'unknown';
            var error = log.error || '—';
            var url = log.url || '—';
            var stack = log.stack || '—';

            html += '<tr class="log-row' + (isMuted ? ' muted' : '') + '" data-id="' + id + '">' +
                '<td class="time">' + escapeHtml(time) + '</td>' +
                '<td class="worker">' + escapeHtml(worker) + '</td>' +
                '<td class="error">' + escapeHtml(error) + '</td>' +
                '<td>' + escapeHtml(url) + '</td>' +
                '<td class="stack">' + escapeHtml(stack) + '</td>' +
                '</tr>';
        });
        tbody.innerHTML = html;
    }

    // ─── Fetch ──────────────────────────────────────────────────
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
            });
    }

    // ─── Mute All ─────────────────────────────────────────────────
    function muteCurrent() {
        var rows = tbody.querySelectorAll('.log-row');
        var ids = [];
        rows.forEach(function(row) {
            var id = row.dataset.id;
            if (id) ids.push(id);
        });
        if (ids.length === 0) {
            showToast('No logs to mute.', false);
            return;
        }
        addSeenIds(ids);
        rows.forEach(function(row) { row.classList.add('muted'); });
        showToast('🔇 Muted ' + ids.length + ' log' + (ids.length > 1 ? 's' : '') + '.', false);
    }

    // ─── Auto‑refresh ────────────────────────────────────────────
    var refreshInterval;

    function startAutoRefresh() {
        if (refreshInterval) clearInterval(refreshInterval);
        refreshInterval = setInterval(fetchLogs, 10000);
    }

    // ─── Init ──────────────────────────────────────────────────
    if (muteBtn) {
        muteBtn.addEventListener('click', muteCurrent);
    }

    fetchLogs();
    startAutoRefresh();

    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) fetchLogs();
    });
})();
