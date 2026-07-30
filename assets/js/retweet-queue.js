// /assets/js/retweet-queue.js
(function() {
    const RETWEET_API_BASE = 'https://auto-retweet.velutinx.workers.dev';
    const RETWEET_TOKEN = 'xK9mQ2v7nP4wR8sL5jH3tY1bF6cE0dZ8aU4nW2xQ=';

    let previousQueue = [];

    async function fetchRetweetQueue() {
        try {
            const res = await fetch(RETWEET_API_BASE + '/api/queue', {
                headers: { 'Authorization': 'Bearer ' + RETWEET_TOKEN }
            });
            if (!res.ok) throw new Error('Failed to fetch queue');
            return await res.json();
        } catch (err) {
            console.error('Queue fetch error:', err);
            return [];
        }
    }

    function showRetweetToast(message) {
        if (typeof showToast === 'function') {
            showToast(message, 'info');
        } else {
            const toast = document.createElement('div');
            toast.className = 'toast-notification info show';
            toast.textContent = message;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }
    }

    function renderRetweetQueue(queue) {
        const container = document.getElementById('retweet-list');
        if (!container) return;

        const tab = document.getElementById('retweet-tab');
        const hasItems = queue && queue.length > 0;
        if (tab) {
            tab.style.display = hasItems ? '' : 'none';
            tab.classList.toggle('has-items', hasItems);
        }

        if (!queue || queue.length === 0) {
            container.innerHTML = '<div class="empty-queue">✨ Queue is empty – new posts will appear here.</div>';
            return;
        }

        let html = '';
        queue.forEach(item => {
            // Build the tweet permalink (always correct)
            const authorStr = (item.author || 'Unknown').replace(/^@/, '');
            const tweetUrl = `https://x.com/${encodeURIComponent(authorStr)}/status/${item.tweetId}`;

            // Format date – use timestamp (tweet creation) as primary
            let dateStr = 'Unknown date';
            let rawTimestamp = item.timestamp || item.addedAt;
            if (rawTimestamp) {
                const dateObj = new Date(rawTimestamp);
                if (!isNaN(dateObj.getTime())) {
                    dateStr = dateObj.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: dateObj.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                    }) + ' ' + dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                }
            }

            // Escape text and preserve line breaks
            const displayText = escapeHtml((item.text || '').replace(/\\n/g, '\n'));

            html += `
                <div class="queue-item" data-id="${item.tweetId}">
                    <div class="content">
                        <a href="${escapeHtml(tweetUrl)}" target="_blank" rel="noopener noreferrer" class="tweet-link">
                            <div class="author">${escapeHtml(item.author || 'Unknown')}</div>
                            <div class="text">${displayText}</div>
                            <div class="meta">${escapeHtml(dateStr)}</div>
                        </a>
                    </div>
                    <div class="actions">
                        <button class="retweet-btn" data-id="${item.tweetId}" data-target="${item.targetAccount}">🔄 Retweet</button>
                        <button class="delete-btn" data-id="${item.tweetId}">✕ Delete</button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;

        // Attach event listeners (unchanged)
        container.querySelectorAll('.retweet-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const tweetId = btn.dataset.id;
                const target = btn.dataset.target;
                btn.disabled = true;
                btn.textContent = '⏳ ...';
                try {
                    const res = await fetch(RETWEET_API_BASE + '/api/queue/retweet', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + RETWEET_TOKEN
                        },
                        body: JSON.stringify({ tweetId, targetAccount: target })
                    });
                    if (!res.ok) throw new Error('Retweet failed');
                    showRetweetToast('✅ Retweeted successfully');
                    const item = btn.closest('.queue-item');
                    item.remove();
                    const remaining = container.querySelectorAll('.queue-item').length;
                    if (remaining === 0) {
                        renderRetweetQueue([]);
                    }
                } catch (err) {
                    showRetweetToast('❌ ' + err.message);
                    btn.disabled = false;
                    btn.textContent = '🔄 Retweet';
                }
            });
        });

        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const tweetId = btn.dataset.id;
                btn.disabled = true;
                btn.textContent = '⏳ ...';
                try {
                    const res = await fetch(RETWEET_API_BASE + '/api/queue/delete', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + RETWEET_TOKEN
                        },
                        body: JSON.stringify({ tweetId })
                    });
                    if (!res.ok) throw new Error('Delete failed');
                    showRetweetToast('🗑️ Removed from queue and blacklisted');
                    const item = btn.closest('.queue-item');
                    item.remove();
                    const remaining = container.querySelectorAll('.queue-item').length;
                    if (remaining === 0) {
                        renderRetweetQueue([]);
                    }
                } catch (err) {
                    showRetweetToast('❌ ' + err.message);
                    btn.disabled = false;
                    btn.textContent = '✕ Delete';
                }
            });
        });
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

    async function refreshQueue() {
        const queue = await fetchRetweetQueue();
        if (previousQueue.length > 0 && queue.length > previousQueue.length) {
            const newItems = queue.filter(item => !previousQueue.some(p => p.tweetId === item.tweetId));
            if (newItems.length > 0) {
                showRetweetToast(`🆕 ${newItems.length} new post${newItems.length>1?'s':''} added to retweet queue`);
            }
        }
        previousQueue = queue;
        renderRetweetQueue(queue);
    }

    window.refreshQueue = refreshQueue;

    document.addEventListener('DOMContentLoaded', () => {
        refreshQueue();

        const tabBtn = document.querySelector('.tab-button[data-tab="retweet"]');
        if (tabBtn) {
            tabBtn.addEventListener('click', () => {
                refreshQueue();
            });
        }

        setInterval(() => {
            const retweetTab = document.getElementById('retweet');
            if (retweetTab && retweetTab.classList.contains('active')) {
                refreshQueue();
            }
        }, 30000);
    });
})();
