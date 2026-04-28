// This is velutinx.github.io/assets/js/bluesky-composer.js

(function() {
    'use strict';

    // ---------- Character Counter ----------
    const CHARS_MAX = 300;

    function updateCharCounter(textarea) {
        const counter = textarea._wc;
        if (!counter) return;
        const length = textarea.value.length;
        const remaining = CHARS_MAX - length;
        counter.textContent = `Characters remaining: ${remaining}`;
        counter.style.color = remaining > 0 ? '#4caf50' : '#f44336';
        counter.style.fontWeight = remaining > 0 ? 'normal' : 'bold';
    }

    // ---------- State ----------
    window.accountImages = window.accountImages || { 1: [], 2: [] };
    const sortableInstances = { 1: null, 2: null };

    // ---------- DOM Elements ----------
    const masterPost = document.getElementById('masterPost');
    const post1 = document.getElementById('post1');
    const post2 = document.getElementById('post2');
    const transformBtn = document.getElementById('transformBtn');

    // ---------- Transform Master Post (fixed hashtag handling) ----------
    function transformMaster() {
        if (!masterPost || !post1 || !post2) return;

        const content = masterPost.value;
        if (!content.trim()) {
            post1.value = '';
            post2.value = '';
            updateCharCounter(post1);
            updateCharCounter(post2);
            return;
        }

        let lines = content.split(/\r?\n/);
        // Remove disclaimer lines
        lines = lines.filter(line => {
            const lower = line.toLowerCase();
            return !lower.includes('免責事項') && !lower.includes('disclaimer:');
        });
        // Trim trailing empty lines
        while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();

        if (lines.length === 0) {
            post1.value = '';
            post2.value = '';
            updateCharCounter(post1);
            updateCharCounter(post2);
            return;
        }

        // Last line is the hashtag line
        let lastLine = lines.pop() || '';
        let finalText = lines.join('\n');
        if (finalText && !finalText.endsWith('\n')) finalText += '\n';

        let hashtags = '';
        if (lastLine.includes('#')) {
            // Already contains hashtags – use it directly
            hashtags = lastLine.trim();
        } else {
            // Split by spaces and add # to each word
            const words = lastLine.trim().split(/\s+/);
            hashtags = words.map(word => `#${word}`).join(' ');
        }

        finalText += hashtags;

        // === DEBUG: print to console ===
        console.log('🔍 Final text sent to Bluesky:\n', finalText);
        // Optional: show a small alert for visibility (remove after debugging)
        // alert('Final text:\n' + finalText);

        post1.value = finalText;
        post2.value = finalText;
        updateCharCounter(post1);
        updateCharCounter(post2);
    }

    // ---------- Render Thumbnails with SortableJS ----------
    function renderThumbnails(accountId) {
        const container = document.querySelector(`.thumbnail-container[data-account="${accountId}"]`);
        if (!container) return;
        container.style.display = 'flex';
        container.style.flexWrap = 'wrap';
        container.style.gap = '8px';

        if (sortableInstances[accountId]) {
            sortableInstances[accountId].destroy();
            sortableInstances[accountId] = null;
        }

        const files = window.accountImages[accountId] || [];
        container.innerHTML = '';

        files.forEach((file, idx) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const wrapper = document.createElement('div');
                wrapper.className = 'cf-selected-item';
                wrapper.dataset.index = idx;
                wrapper.dataset.account = accountId;

                const thumb = document.createElement('img');
                thumb.className = 'cf-selected-thumb';
                thumb.src = e.target.result;
                thumb.style.cursor = 'grab';

                const removeBtn = document.createElement('button');
                removeBtn.className = 'cf-remove-btn';
                removeBtn.textContent = '✕';
                removeBtn.onclick = (ev) => {
                    ev.stopPropagation();
                    window.accountImages[accountId].splice(idx, 1);
                    renderThumbnails(accountId);
                    if (typeof showToast === 'function') showToast('Image removed', 'info');
                };

                wrapper.appendChild(thumb);
                wrapper.appendChild(removeBtn);
                container.appendChild(wrapper);
            };
            reader.readAsDataURL(file);
        });

        setTimeout(() => {
            sortableInstances[accountId] = new Sortable(container, {
                animation: 150,
                handle: '.cf-selected-thumb',
                ghostClass: 'cf-sortable-ghost',
                dragClass: 'cf-sortable-drag',
                onEnd: function() {
                    const newOrder = [];
                    Array.from(container.children).forEach(child => {
                        const idx = parseInt(child.dataset.index, 10);
                        if (!isNaN(idx) && window.accountImages[accountId][idx]) {
                            newOrder.push(window.accountImages[accountId][idx]);
                        }
                    });
                    window.accountImages[accountId] = newOrder;
                    Array.from(container.children).forEach((child, newIdx) => {
                        child.dataset.index = newIdx;
                    });
                    if (typeof showToast === 'function') showToast('Order updated', 'info');
                }
            });
        }, 50);
    }

    // ---------- Setup Dropzones ----------
    function setupDropzones() {
        document.querySelectorAll('.dropzone').forEach(dz => {
            const accountId = dz.dataset.account;
            if (!accountId) return;

            dz.addEventListener('click', () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = true;
                input.accept = 'image/*';
                input.onchange = () => {
                    if (input.files.length) {
                        window.accountImages[accountId].push(...Array.from(input.files));
                        renderThumbnails(accountId);
                        if (typeof showToast === 'function') showToast(`+${input.files.length} images added`, 'success');
                    }
                };
                input.click();
            });

            dz.addEventListener('dragover', (e) => {
                e.preventDefault();
                dz.style.borderColor = '#6a8e3c';
            });
            dz.addEventListener('dragleave', () => {
                dz.style.borderColor = '#3a4050';
            });
            dz.addEventListener('drop', (e) => {
                e.preventDefault();
                dz.style.borderColor = '#3a4050';
                const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                if (files.length) {
                    window.accountImages[accountId].push(...files);
                    renderThumbnails(accountId);
                    if (typeof showToast === 'function') showToast(`${files.length} dropped`, 'success');
                }
            });
        });
    }

    // ---------- Post to Bluesky ----------
    async function postToBluesky(accountId) {
        const postEl = document.getElementById(`post${accountId}`);
        if (!postEl) return;

        const text = postEl.value.trim();
        const images = window.accountImages[accountId] || [];

        if (!text && images.length === 0) {
            if (typeof showToast === 'function') showToast('Add text or image first', 'error');
            return;
        }

        let statusDiv = document.getElementById(`post-status-${accountId}`);
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.id = `post-status-${accountId}`;
            statusDiv.style.marginTop = '8px';
            statusDiv.style.fontSize = '12px';
            postEl.parentNode.appendChild(statusDiv);
        }
        statusDiv.textContent = '⏳ Posting...';
        statusDiv.style.color = '#aaa';

        try {
            const formData = new FormData();
            formData.append('account', accountId);
            formData.append('text', text);
            images.forEach(img => formData.append('image', img));

            const response = await fetch('https://bluesky-post-proxy-final.velutinx.workers.dev', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (response.ok) {
                statusDiv.textContent = '✅ Posted!';
                statusDiv.style.color = '#4caf50';
                if (typeof showToast === 'function') showToast(`Posted to ${accountId == 1 ? 'SFW' : 'NSFW'} account`, 'success');
                window.accountImages[accountId] = [];
                renderThumbnails(accountId);
                setTimeout(() => statusDiv.textContent = '', 2500);
            } else {
                statusDiv.textContent = `❌ ${data.error || 'failed'}`;
                if (typeof showToast === 'function') showToast(`Error: ${data.error || 'server error'}`, 'error');
            }
        } catch (err) {
            statusDiv.textContent = `❌ ${err.message}`;
            if (typeof showToast === 'function') showToast(`Network error: ${err.message}`, 'error');
        }
    }

    // ---------- Add "Post to Bluesky" Buttons ----------
    function addPostButtons() {
        document.querySelectorAll('.account-card').forEach(card => {
            const accountId = card.dataset.account;
            if (!accountId) return;
            if (card.querySelector('.bluesky-post-btn')) return;

            const btn = document.createElement('button');
            btn.textContent = '🚀 Post to Bluesky';
            btn.className = 'bluesky-post-btn';
            btn.style.cssText = 'margin-top:16px; width:100%; padding:8px; background:#2c6e2c; border:none; border-radius:30px; color:white; cursor:pointer; font-weight:500;';
            btn.onclick = () => postToBluesky(accountId);
            card.appendChild(btn);
        });
    }

    // ---------- Initialize Module ----------
    function init() {
        if (!masterPost) {
            console.warn('Bluesky Composer: Required elements not found.');
            return;
        }

        function installCharCounter(textarea) {
            if (!textarea) return;
            const parent = textarea.parentNode;
            if (parent.querySelector('.word-counter')) return;
            const counter = document.createElement('div');
            counter.className = 'word-counter';
            counter.style.cssText = 'margin-top: 6px; font-size: 0.85rem;';
            parent.insertBefore(counter, textarea.nextSibling);
            textarea._wc = counter;
            textarea.addEventListener('input', () => updateCharCounter(textarea));
            textarea.addEventListener('keyup', () => updateCharCounter(textarea));
            updateCharCounter(textarea);
        }

        installCharCounter(masterPost);
        installCharCounter(post1);
        installCharCounter(post2);

        masterPost.addEventListener('input', transformMaster);
        if (transformBtn) transformBtn.addEventListener('click', transformMaster);
        transformMaster();

        setupDropzones();
        renderThumbnails(1);
        renderThumbnails(2);
        addPostButtons();

    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.renderBlueskyThumbnails = renderThumbnails;
})();
