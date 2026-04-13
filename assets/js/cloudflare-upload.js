// This is velutinx.github.io/assets/js/cloudflare-upload.js

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

    // ---------- Render Thumbnails with SortableJS ----------
    function renderThumbnails(accountId) {
        const container = document.querySelector(`.thumbnail-container[data-account="${accountId}"]`);
        if (!container) return;

        // Destroy existing Sortable instance
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
                wrapper.className = 'cf-selected-item'; // reuse Cloudflare style
                wrapper.dataset.index = idx;
                wrapper.dataset.account = accountId;

                const thumb = document.createElement('img');
                thumb.className = 'cf-selected-thumb';
                thumb.src = e.target.result;
                wrapper.appendChild(thumb);

                const removeBtn = document.createElement('button');
                removeBtn.className = 'cf-remove-btn';
                removeBtn.textContent = '✕';
                removeBtn.onclick = (ev) => {
                    ev.stopPropagation();
                    // Remove from array
                    window.accountImages[accountId].splice(idx, 1);
                    renderThumbnails(accountId);
                    if (typeof showToast === 'function') {
                        showToast('Image removed', 'info');
                    }
                };
                wrapper.appendChild(removeBtn);

                container.appendChild(wrapper);
            };
            reader.readAsDataURL(file);
        });

        // Initialize Sortable after all images are appended
        // Wait a tick to ensure DOM is fully populated (FileReader is async)
        setTimeout(() => {
            sortableInstances[accountId] = new Sortable(container, {
                animation: 150,
                handle: '.cf-selected-thumb',  // drag by image only
                onEnd: function() {
                    // Update accountImages array to match new DOM order
                    const newOrder = [];
                    Array.from(container.children).forEach(child => {
                        const idx = parseInt(child.dataset.index, 10);
                        if (!isNaN(idx) && window.accountImages[accountId][idx]) {
                            newOrder.push(window.accountImages[accountId][idx]);
                        }
                    });
                    window.accountImages[accountId] = newOrder;
                    // Re-render to fix data-index attributes (keeps consistency)
                    renderThumbnails(accountId);
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

        masterPost.addEventListener('input', transformMaster);
        transformMaster();

        if (transformBtn) transformBtn.addEventListener('click', transformMaster);

        setupDropzones();
        renderThumbnails(1);
        renderThumbnails(2);
        addPostButtons();

        console.log('✅ Bluesky Composer initialized (with SortableJS reordering)');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.renderBlueskyThumbnails = renderThumbnails;
})();

        // Event listeners for this tab
        dropzone.addEventListener('click', () => fileInput.click());
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.style.borderColor = '#5a6e3c';
        });
        dropzone.addEventListener('dragleave', () => {
            dropzone.style.borderColor = '#3a4050';
        });
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.style.borderColor = '#3a4050';
            const file = e.dataTransfer.files[0];
            if (file && file.name.toLowerCase().endsWith('.zip')) {
                processZip(file);
            } else {
                showToast('Please drop a .zip file', 'error');
            }
        });
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                processZip(e.target.files[0]);
                fileInput.value = '';
            }
        });
        downloadBtn.addEventListener('click', handleAction);

        // Listen for shared data updates from other tab
        window.addEventListener('zipDataUpdated', (event) => {
            const data = event.detail;
            if (data && data.allImages && data.source !== 'cloudflare') {
                loadSharedData(data);
                // Also update local selections from shared data
                selectedIndices = data.selectedIndices ? new Set(data.selectedIndices) : new Set();
                selectedOrder = data.selectedOrder ? [...data.selectedOrder] : [];
                renderOriginal();
                renderSelected();
            }
        });

        // If shared data already exists (e.g., after page load if Subscribestar tab loaded a ZIP first), load it
        if (window.sharedZipData && window.sharedZipData.allImages) {
            loadSharedData(window.sharedZipData);
        }
    };
})();
