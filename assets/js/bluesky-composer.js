// This is velutinx.github.io/assets/js/bluesky-composer.js

(function() {
    'use strict';

    // ---------- Utility: Convert concatenated words into hashtags ----------
    function textToHashtags(text) {
        const segments = [];
        let current = '';
        let lastType = null;
        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            const isSpace = /\s/.test(ch);
            const isLatin = /[a-zA-Z0-9]/.test(ch);
            let type = null;
            if (isSpace) type = 'space';
            else type = isLatin ? 'latin' : 'nonlatin';

            if (type === 'space') {
                current += ch;
                continue;
            }
            if (lastType === null) {
                current += ch;
                lastType = type;
            } else if (type === lastType) {
                current += ch;
            } else {
                if (current.trim()) segments.push(current.trim());
                current = ch;
                lastType = type;
            }
        }
        if (current.trim()) segments.push(current.trim());
        return segments.map(seg => `#${seg.replace(/\s+/g, '')}`).join(' ');
    }

    // ---------- Word Counter ----------
    const WORDS_MAX = 300;

    function updateWordCounter(textarea) {
        // Find the counter div immediately after this textarea
        let counter = textarea.nextElementSibling;
        if (!counter || !counter.classList.contains('word-counter')) {
            // If not found, try to locate by class (fallback)
            counter = textarea.parentNode.querySelector('.word-counter');
        }
        if (!counter) return;

        const text = textarea.value.trim();
        const words = text === '' ? 0 : text.split(/\s+/).length;
        const remaining = WORDS_MAX - words;
        counter.textContent = `Words remaining: ${remaining}`;
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

    // ---------- Transform Master Post ----------
    function transformMaster() {
        if (!masterPost || !post1 || !post2) return;

        const content = masterPost.value;
        if (!content.trim()) {
            post1.value = '';
            post2.value = '';
            updateWordCounter(post1);
            updateWordCounter(post2);
            return;
        }

        let lines = content.split(/\r?\n/);
        lines = lines.filter(line => {
            const lower = line.toLowerCase();
            return !lower.includes('免責事項') && !lower.includes('disclaimer:');
        });
        while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();

        if (lines.length === 0) {
            post1.value = '';
            post2.value = '';
            updateWordCounter(post1);
            updateWordCounter(post2);
            return;
        }

        let lastLine = lines.pop() || '';
        const hashtags = textToHashtags(lastLine);
        let finalText = lines.join('\n');
        if (finalText && !finalText.endsWith('\n')) finalText += '\n';
        finalText += hashtags;

        post1.value = finalText;
        post2.value = finalText;
        updateWordCounter(post1);
        updateWordCounter(post2);
    }

    // ---------- Render Thumbnails with SortableJS (Cloudflare style) ----------
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
                    if (typeof showToast === 'function') {
                        showToast('Image removed', 'info');
                    }
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

                    if (typeof showToast === 'function') {
                        showToast('Order updated', 'info');
                    }
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
                        if (typeof showToast === 'function') {
                            showToast(`+${input.files.length} images added`, 'success');
                        }
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
                    if (typeof showToast === 'function') {
                        showToast(`${files.length} dropped`, 'success');
                    }
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
                if (typeof showToast === 'function') {
                    showToast(`Posted to ${accountId == 1 ? 'SFW' : 'NSFW'} account`, 'success');
                }
                window.accountImages[accountId] = [];
                renderThumbnails(accountId);
                setTimeout(() => statusDiv.textContent = '', 2500);
            } else {
                statusDiv.textContent = `❌ ${data.error || 'failed'}`;
                if (typeof showToast === 'function') {
                    showToast(`Error: ${data.error || 'server error'}`, 'error');
                }
            }
        } catch (err) {
            statusDiv.textContent = `❌ ${err.message}`;
            if (typeof showToast === 'function') {
                showToast(`Network error: ${err.message}`, 'error');
            }
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

        // ---- Word counters for masterPost, post1, post2 ----
        function attachWordCounter(textarea) {
            if (!textarea) return;
            // Avoid duplicates
            if (textarea.parentNode.querySelector('.word-counter')) return;

            const counter = document.createElement('div');
            counter.className = 'word-counter';
            counter.style.cssText = 'margin-top: 6px; font-size: 0.85rem;';
            textarea.parentNode.insertBefore(counter, textarea.nextSibling);
            updateWordCounter(textarea);

            // Use both 'input' and 'keyup' to be absolutely sure it updates on typing
            textarea.addEventListener('input', () => updateWordCounter(textarea));
            textarea.addEventListener('keyup', () => updateWordCounter(textarea));
        }

        attachWordCounter(masterPost);
        attachWordCounter(post1);
        attachWordCounter(post2);

        // ---- Transform events ----
        masterPost.addEventListener('input', transformMaster);
        if (transformBtn) transformBtn.addEventListener('click', transformMaster);
        transformMaster();  // initial fill

        // ---- Dropzones & thumbs ----
        setupDropzones();
        renderThumbnails(1);
        renderThumbnails(2);
        addPostButtons();

        console.log('✅ Bluesky Composer initialized (Cloudflare-style drag)');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.renderBlueskyThumbnails = renderThumbnails;
})();
