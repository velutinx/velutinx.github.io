// assets/js/contact-messages.js
(function() {
    'use strict';

    // ─── Point directly to the worker ──────────────────────────
    const API_BASE = 'https://contact-handler.velutinx.workers.dev/api/contact';

    const tabButton = document.getElementById('contact-tab');
    const badge = document.getElementById('contactBadge');
    const listContainer = document.getElementById('contact-list');
    const markAllBtn = document.getElementById('markAllReadBtn');

    // ─── Helper: fetch unread count ──────────────────────────
    async function fetchUnreadCount() {
        try {
            const res = await fetch(`${API_BASE}/unread-count`);
            if (!res.ok) throw new Error('Failed to fetch count');
            const data = await res.json();
            return data.count || 0;
        } catch (err) {
            console.error('Unread count error:', err);
            return 0;
        }
    }

    // ─── Helper: fetch messages ──────────────────────────────
    async function fetchMessages() {
        try {
            const res = await fetch(`${API_BASE}/messages`);
            if (!res.ok) throw new Error('Failed to fetch messages');
            const data = await res.json();
            return data || [];
        } catch (err) {
            console.error('Messages fetch error:', err);
            return [];
        }
    }

    // ─── Render messages (expandable) ────────────────────────
    function renderMessages(messages) {
        if (!listContainer) return;

        if (!messages || messages.length === 0) {
            listContainer.innerHTML = '<div class="empty-message">No messages yet.</div>';
            return;
        }

        let html = '';
        messages.forEach((msg) => {
            const created = new Date(msg.created_at).toLocaleString();
            const isRead = msg.is_read ? 'read' : 'unread';
            const subject = msg.subject || 'No subject';

            html += `
                <div class="contact-item ${isRead}" data-id="${msg.id}">
                    <div class="contact-header" onclick="toggleContactDetail(this)">
                        <span class="contact-subject">${escapeHtml(subject)}</span>
                        <span class="contact-sender">${escapeHtml(msg.name)}</span>
                        <span class="contact-date">${created}</span>
                        <span class="contact-toggle">▼</span>
                    </div>
                    <div class="contact-detail" style="display:none;">
                        <div><strong>Name:</strong> ${escapeHtml(msg.name)}</div>
                        <div><strong>Email:</strong> <a href="mailto:${escapeHtml(msg.email)}">${escapeHtml(msg.email)}</a></div>
                        <div><strong>Message:</strong><br>${escapeHtml(msg.message).replace(/\n/g, '<br>')}</div>
                        <div style="margin-top:8px;font-size:0.8rem;color:#888;">
                            ${created}
                        </div>
                        <button class="mark-read-btn" data-id="${msg.id}">Mark as read</button>
                    </div>
                </div>
            `;
        });

        listContainer.innerHTML = html;

        document.querySelectorAll('.mark-read-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                await markAsRead(id);
                await refreshAll();
            });
        });
    }

    // ─── Mark a message as read ───────────────────────────────
    async function markAsRead(id) {
        try {
            const res = await fetch(`${API_BASE}/mark-read`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (!res.ok) throw new Error('Failed to mark as read');
        } catch (err) {
            console.error('Mark read error:', err);
        }
    }

    // ─── Mark all messages as read ────────────────────────────
    async function markAllAsRead() {
        try {
            const messages = await fetchMessages();
            const unread = messages.filter(m => !m.is_read);
            if (unread.length === 0) return;

            for (const msg of unread) {
                await markAsRead(msg.id);
            }
            await refreshAll();
            showToast(`✅ Marked ${unread.length} messages as read.`);
        } catch (err) {
            console.error('Mark all read error:', err);
        }
    }

    // ─── Update tab visibility and badge ──────────────────────
    function updateTabState(count) {
        if (tabButton) {
            if (count > 0) {
                tabButton.style.display = 'inline-block';
                tabButton.classList.add('has-items');
                badge.textContent = count;
                badge.style.display = 'inline';
            } else {
                tabButton.style.display = 'none';
                tabButton.classList.remove('has-items');
                badge.style.display = 'none';
                badge.textContent = '';
            }
        }
    }

    // ─── Refresh everything ──────────────────────────────────
    async function refreshAll() {
        const count = await fetchUnreadCount();
        updateTabState(count);
        const messages = await fetchMessages();
        renderMessages(messages);

        if (markAllBtn) {
            markAllBtn.onclick = markAllAsRead;
            markAllBtn.style.display = count > 0 ? 'inline-block' : 'none';
        }
    }

    // ─── Toggle detail expand/collapse ──────────────────────
    window.toggleContactDetail = function(header) {
        const detail = header.nextElementSibling;
        const toggle = header.querySelector('.contact-toggle');
        if (detail.style.display === 'none') {
            detail.style.display = 'block';
            toggle.textContent = '▲';
        } else {
            detail.style.display = 'none';
            toggle.textContent = '▼';
        }
    };

    // ─── Escape HTML ─────────────────────────────────────────
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // ─── Toast notification ──────────────────────────────────
    function showToast(msg) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification show';
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // ─── Polling (every 30 seconds) ─────────────────────────
    let pollInterval = null;

    function startPolling() {
        if (pollInterval) clearInterval(pollInterval);
        pollInterval = setInterval(refreshAll, 30000);
    }

    // ─── Init ────────────────────────────────────────────────
    async function init() {
        // Ensure tab is hidden initially
        if (tabButton) {
            tabButton.style.display = 'none';
            tabButton.classList.remove('has-items');
        }
        await refreshAll();
        startPolling();

        if (tabButton) {
            tabButton.addEventListener('click', refreshAll);
        }
    }

    // ─── Run when DOM is ready ──────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
