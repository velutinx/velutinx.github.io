// assets/js/contact-messages.js
(function() {
    'use strict';

    const API_BASE = 'https://contact-handler.velutinx.workers.dev/api/contact';

    const tabButton = document.getElementById('contact-tab');
    const listContainer = document.getElementById('contact-list');
    const markAllBtn = document.getElementById('markAllReadBtn');

    // ─── Helper: fetch messages (cache‑bust) ────────────────────
    async function fetchMessages() {
        try {
            const cacheBust = Date.now();
            const res = await fetch(`${API_BASE}/messages?t=${cacheBust}`);
            if (!res.ok) throw new Error('Failed to fetch messages');
            const data = await res.json();
            return data || [];
        } catch (err) {
            console.error('Messages fetch error:', err);
            return [];
        }
    }

    // ─── Render ONLY unread messages ─────────────────────────────
function renderMessages(messages) {
    if (!listContainer) return;

    const unreadMessages = messages.filter(msg => !msg.is_read);

    if (unreadMessages.length === 0) {
        listContainer.innerHTML = '<div class="empty-message">✨ No unread messages.</div>';
        return;
    }

    let html = '';
    unreadMessages.forEach((msg) => {
        const created = new Date(msg.created_at).toLocaleString();
        const subject = msg.subject || 'No subject';
        const senderDisplay = msg.name || 'Unknown Sender';
        const sourceLabel = msg.source === 'patreon' ? 'PATREON:' : (msg.source === 'subscribestar' ? 'SUBSCRIBESTAR:' : '');
        let messageHtml = escapeHtml(msg.message);
        // If link exists, wrap the message in <a> tag
        if (msg.link) {
            messageHtml = `<a href="${escapeHtml(msg.link)}" target="_blank" rel="noopener noreferrer">${messageHtml}</a>`;
        }

        html += `
            <div class="contact-item unread" data-id="${msg.id}">
                <div class="contact-header" onclick="toggleContactDetail(this)">
                    <span class="contact-subject">
                        ${sourceLabel ? `<strong>${sourceLabel}</strong> ` : ''}${escapeHtml(subject)}
                    </span>
                    <span class="contact-sender">${escapeHtml(senderDisplay)}</span>
                    <span class="contact-date">${created}</span>
                    <span class="contact-toggle">▼</span>
                </div>
                <div class="contact-detail" style="display:none;">
                    <div><strong>Name:</strong> ${escapeHtml(msg.name)}</div>
                    <div><strong>Email:</strong> <a href="mailto:${escapeHtml(msg.email)}">${escapeHtml(msg.email)}</a></div>
                    <div><strong>Message:</strong><br>${messageHtml}</div>
                    <div style="margin-top:8px;font-size:0.8rem;color:#888;">${created}</div>
                    <button class="mark-read-btn" data-id="${msg.id}">Mark as read</button>
                </div>
            </div>
        `;
    });

    listContainer.innerHTML = html;

        // ─── Attach "Mark as read" events ──────────────────────
        document.querySelectorAll('.mark-read-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const item = btn.closest('.contact-item');
                btn.disabled = true;
                btn.textContent = '⏳ ...';

                try {
                    const success = await markAsRead(id);
                    if (success) {
                        // Remove the item from the DOM immediately
                        if (item) {
                            item.style.transition = 'opacity 0.3s';
                            item.style.opacity = '0';
                            setTimeout(() => {
                                item.remove();
                                const remaining = document.querySelectorAll('.contact-item').length;
                                if (remaining === 0) {
                                    listContainer.innerHTML = '<div class="empty-message">✨ No unread messages.</div>';
                                }
                                updateUnreadState();
                            }, 300);
                        }
                        showToast('✅ Marked as read');
                    } else {
                        btn.disabled = false;
                        btn.textContent = 'Mark as read';
                        showToast('❌ Failed to mark as read', true);
                    }
                } catch (err) {
                    console.error(err);
                    btn.disabled = false;
                    btn.textContent = 'Mark as read';
                    showToast('❌ Error: ' + err.message, true);
                }
            });
        });
    }

    // ─── Mark a message as read ──────────────────────────────────
    async function markAsRead(id) {
        try {
            const res = await fetch(`${API_BASE}/mark-read`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || 'Failed to mark as read');
            }
            return true;
        } catch (err) {
            console.error('Mark read error:', err);
            return false;
        }
    }

    // ─── Mark all messages as read ──────────────────────────────
    async function markAllAsRead() {
        const btn = markAllBtn;
        if (btn) {
            btn.disabled = true;
            btn.textContent = '⏳ ...';
        }

        try {
            const messages = await fetchMessages();
            const unread = messages.filter(m => !m.is_read);
            if (unread.length === 0) {
                showToast('No unread messages');
                if (btn) btn.disabled = false;
                return;
            }

            let successCount = 0;
            for (const msg of unread) {
                const ok = await markAsRead(msg.id);
                if (ok) successCount++;
            }

            await refreshAll();
            showToast(`✅ Marked ${successCount} messages as read`);
        } catch (err) {
            console.error('Mark all read error:', err);
            showToast('❌ ' + err.message, true);
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.textContent = '✅ Mark All Read';
            }
        }
    }

    // ─── Update unread count and tab flash ──────────────────────
    async function updateUnreadState() {
        const messages = await fetchMessages();
        const unreadCount = messages.filter(m => !m.is_read).length;
        if (tabButton) {
            tabButton.classList.toggle('has-items', unreadCount > 0);
        }
        if (markAllBtn) {
            markAllBtn.style.display = unreadCount > 0 ? 'inline-block' : 'none';
            markAllBtn.textContent = unreadCount > 0 ? '✅ Mark All Read' : 'All read';
        }
        return unreadCount;
    }

    // ─── Refresh everything ──────────────────────────────────────
    async function refreshAll() {
        const messages = await fetchMessages();
        const unreadCount = messages.filter(m => !m.is_read).length;
        if (tabButton) {
            tabButton.classList.toggle('has-items', unreadCount > 0);
        }
        renderMessages(messages); // Now only renders unread
        if (markAllBtn) {
            markAllBtn.onclick = markAllAsRead;
            markAllBtn.style.display = unreadCount > 0 ? 'inline-block' : 'none';
            markAllBtn.textContent = unreadCount > 0 ? '✅ Mark All Read' : 'All read';
        }
    }

    // ─── Toggle detail expand/collapse ──────────────────────────
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

    // ─── Escape HTML ────────────────────────────────────────────
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // ─── Toast notification ─────────────────────────────────────
    function showToast(msg, isError = false) {
        const toast = document.createElement('div');
        toast.className = `toast-notification show ${isError ? 'error' : ''}`;
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // ─── Polling (every 30 seconds) ─────────────────────────────
    let pollInterval = null;

    function startPolling() {
        if (pollInterval) clearInterval(pollInterval);
        pollInterval = setInterval(refreshAll, 30000);
    }

    // ─── Init ────────────────────────────────────────────────────
    async function init() {
        if (tabButton) {
            tabButton.classList.remove('has-items');
        }
        await refreshAll();
        startPolling();

        if (tabButton) {
            tabButton.addEventListener('click', refreshAll);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
