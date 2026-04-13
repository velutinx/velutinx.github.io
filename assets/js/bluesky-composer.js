/**
 * Bluesky Composer Module
 * Handles master post transformation, image management, drag/drop reordering,
 * and posting to the Bluesky worker proxy.
 * 
 * Dependencies:
 * - Global showToast(message, type) function (must be defined elsewhere)
 * - SortableJS (already loaded globally)
 * - DOM elements: #masterPost, #post1, #post2, .dropzone[data-account], 
 *   .thumbnail-container[data-account], .account-card[data-account]
 */

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

    // ---------- State ----------
    // Store images per account (1 = SFW, 2 = NSFW)
    window.accountImages = window.accountImages || { 1: [], 2: [] };

    // Drag & drop reorder state
    let dragSource = null;

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
            return;
        }

        let lastLine = lines.pop() || '';
        const hashtags = textToHashtags(lastLine);
        let finalText = lines.join('\n');
        if (finalText && !finalText.endsWith('\n')) finalText += '\n';
        finalText += hashtags;

        post1.value = finalText;
        post2.value = finalText;
    }

    // ---------- Render Thumbnails for an Account ----------
    function renderThumbnails(accountId) {
        const container = document.querySelector(`.thumbnail-container[data-account="${accountId}"]`);
        if (!container) return;

        const files = window.accountImages[accountId] || [];
        container.innerHTML = '';

        files.forEach((file, idx) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const div = document.createElement('div');
                div.className = 'thumbnail-item';
                div.draggable = true;
                div.dataset.index = idx;
                div.dataset.account = accountId;

                const img = document.createElement('img');
                img.src = e.target.result;
                div.appendChild(img);

                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-btn';
                removeBtn.textContent = '✕';
                removeBtn.onclick = (ev) => {
                    ev.stopPropagation();
                    window.accountImages[accountId].splice(idx, 1);
                    renderThumbnails(accountId);
                    if (typeof showToast === 'function') {
                        showToast('Image removed', 'info');
                    }
                };
                div.appendChild(removeBtn);

                div.addEventListener('dragstart', handleDragStart);
                div.addEventListener('dragover', (e) => e.preventDefault());
                div.addEventListener('drop', handleDrop);
                div.addEventListener('dragend', () => div.classList.remove('dragging'));

                container.appendChild(div);
            };
            reader.readAsDataURL(file);
        });
    }

    // ---------- Drag & Drop Handlers ----------
    function handleDragStart(e) {
        dragSource = e.target.closest('.thumbnail-item');
        if (!dragSource) return;
        e.dataTransfer.setData('text/plain', '');
        dragSource.classList.add('dragging');
    }

    function handleDrop(e) {
        e.preventDefault();
        const target = e.target.closest('.thumbnail-item');
        if (!target || !dragSource || target === dragSource) return;

        const srcAcc = dragSource.dataset.account;
        const tgtAcc = target.dataset.account;
        if (srcAcc !== tgtAcc) return; // only reorder within same account

        const container = target.parentNode;
        const items = [...container.querySelectorAll('.thumbnail-item')];
        const srcIdx = items.indexOf(dragSource);
        const tgtIdx = items.indexOf(target);

        const files = window.accountImages[srcAcc];
        const [moved] = files.splice(srcIdx, 1);
        files.splice(tgtIdx, 0, moved);

        renderThumbnails(srcAcc);
        if (typeof showToast === 'function') {
            showToast('Order updated', 'info');
        }
    }

    // ---------- Setup Dropzones ----------
    function setupDropzones() {
        document.querySelectorAll('.dropzone').forEach(dz => {
            const accountId = dz.dataset.account;
            if (!accountId) return;

            // Click to open file dialog
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

            // Drag over
            dz.addEventListener('dragover', (e) => {
                e.preventDefault();
                dz.style.borderColor = '#6a8e3c';
            });
            dz.addEventListener('dragleave', () => {
                dz.style.borderColor = '#3a4050';
            });

            // Drop
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

        // Create/update status indicator
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
                // Clear images after successful post
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

            // Avoid duplicate buttons
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
            console.warn('Bluesky Composer: Required elements not found. Is the Bluesky tab present?');
            return;
        }

        // Set up master post transformation
        masterPost.addEventListener('input', transformMaster);
        transformMaster(); // initial sync

        // Set up transform button (if exists)
        if (transformBtn) {
            transformBtn.addEventListener('click', transformMaster);
        }

        // Initialize dropzones
        setupDropzones();

        // Render existing images (if any)
        renderThumbnails(1);
        renderThumbnails(2);

        // Add post buttons
        addPostButtons();

        console.log('✅ Bluesky Composer initialized');
    }

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose render function for external use (optional)
    window.renderBlueskyThumbnails = renderThumbnails;
})();
