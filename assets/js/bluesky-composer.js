// velutinx.github.io/assets/js/bluesky-composer.js

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

    // ---------- Global Image Registry ----------
    window.imageRegistry = window.imageRegistry || {};

    function addImage(file) {
        const id = Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 6);
        window.imageRegistry[id] = file;
        return id;
    }

    // ---------- State: arrays of image IDs ----------
    window.accountImages = window.accountImages || { 1: [], 2: [] };
    const sortableInstances = { 1: null, 2: null };

    // ---------- DOM Elements ----------
    const masterPost = document.getElementById('masterPost');
    const post1 = document.getElementById('post1');
    const post2 = document.getElementById('post2');

    // ---------- SFW Twitter button lock helpers ----------
    function getSfwTwitterBtn() {
        // The button that calls sendToWorker(3) – SFW Twitter
        return document.querySelector('button[onclick="sendToWorker(3)"]');
    }
    function disableSfwTwitterBtn() {
        const btn = getSfwTwitterBtn();
        if (btn) {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
            btn.title = 'Already posted via Bluesky – add new content to re‑enable';
        }
    }
    function enableSfwTwitterBtn() {
        const btn = getSfwTwitterBtn();
        if (btn) {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
            btn.title = '';
        }
    }
    function clearSfwTwitter() {
        const twTextarea = document.getElementById('twitter-post-3');
        if (twTextarea) {
            twTextarea.value = '';
            twTextarea.dispatchEvent(new Event('input'));
        }
        // The Twitter card reads from accountImages[1], so clearing that clears the Twitter images too
        window.accountImages[1] = [];
        if (typeof window.renderTwitterThumbnails === 'function') {
            window.renderTwitterThumbnails(3);
        }
    }
    function lockSfwTwitter() {
        clearSfwTwitter();
        disableSfwTwitterBtn();
    }
    function unlockSfwTwitterIfNeeded() {
        // Re-enable the SFW Twitter button if there's content in either
        // the SFW Bluesky card or the SFW Twitter textarea
        const twText = (document.getElementById('twitter-post-3')?.value || '').trim();
        const bsText = (post1?.value || '').trim();
        const bsImages = window.accountImages[1]?.length || 0;
        if (twText || bsText || bsImages) {
            enableSfwTwitterBtn();
        }
    }

    // ---------- Refresh Twitter cards ----------
    function refreshTwitterFromBluesky(blueskyAccountId) {
        if (typeof window.renderTwitterThumbnails !== 'function') return;
        if (blueskyAccountId == 1) {
            window.renderTwitterThumbnails(3);
        } else if (blueskyAccountId == 2) {
            window.renderTwitterThumbnails(1);
            window.renderTwitterThumbnails(2);
        }
    }

    // ---------- Render Thumbnails ----------
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

        const ids = window.accountImages[accountId] || [];
        container.innerHTML = '';

        ids.forEach((id, idx) => {
            const file = window.imageRegistry[id];
            if (!file) return;
            const url = URL.createObjectURL(file);

            const wrapper = document.createElement('div');
            wrapper.className = 'cf-selected-item';
            wrapper.dataset.index = idx;
            wrapper.dataset.id = id;
            wrapper.dataset.account = accountId;

            const thumb = document.createElement('img');
            thumb.className = 'cf-selected-thumb';
            thumb.src = url;
            thumb.style.cursor = 'grab';
            thumb.onload = () => URL.revokeObjectURL(url);
            thumb.onerror = () => URL.revokeObjectURL(url);

            const cropBtn = document.createElement('button');
            cropBtn.className = 'cf-crop-btn';
            cropBtn.innerHTML = '✂️';
            cropBtn.title = 'Crop image (free rectangle)';
            cropBtn.onclick = (ev) => {
                ev.stopPropagation();
                openCropModal(file, accountId, idx);
            };

            const removeBtn = document.createElement('button');
            removeBtn.className = 'cf-remove-btn';
            removeBtn.textContent = '✕';
            removeBtn.onclick = (ev) => {
                ev.stopPropagation();
                const removedId = wrapper.dataset.id;
                if (removedId) {
                    const pos = window.accountImages[accountId].indexOf(removedId);
                    if (pos !== -1) window.accountImages[accountId].splice(pos, 1);
                    let inUse = false;
                    for (const arr of Object.values(window.accountImages)) {
                        if (arr.includes(removedId)) { inUse = true; break; }
                    }
                    if (!inUse) delete window.imageRegistry[removedId];
                }
                renderThumbnails(accountId);
                refreshTwitterFromBluesky(accountId);
                // Unlock SFW Twitter if relevant
                if (accountId == 1) unlockSfwTwitterIfNeeded();
                if (typeof showToast === 'function') showToast('Image removed', 'info');
            };

            wrapper.appendChild(thumb);
            wrapper.appendChild(cropBtn);
            wrapper.appendChild(removeBtn);
            container.appendChild(wrapper);
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
                        const id = child.dataset.id;
                        if (id && window.imageRegistry[id]) {
                            newOrder.push(id);
                        }
                    });
                    window.accountImages[accountId] = newOrder;
                    Array.from(container.children).forEach((child, i) => { child.dataset.index = i; });
                    refreshTwitterFromBluesky(accountId);
                    if (typeof showToast === 'function') showToast('Order updated', 'info');
                }
            });
        }, 50);
    }

    // ---------- CROP MODAL (unchanged) ----------
    function openCropModal(file, accountId, index) {
        const modal = document.getElementById('cropModal');
        const canvas = document.getElementById('cropCanvas');
        const ctx = canvas.getContext('2d');
        const doneBtn = document.getElementById('cropDoneBtn');
        const cancelBtn = document.getElementById('cropCancelBtn');

        const maxWidth = Math.min(800, window.innerWidth * 0.8);
        const maxHeight = Math.min(800, window.innerHeight * 0.7);

        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            let scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            canvas.style.width = '100%';
            canvas.style.height = 'auto';
            redrawCanvas();
            modal.style.display = 'flex';
        };

        let dragging = false, isMoving = false, startX, startY,
            rect = null, moveOffset = { x: 0, y: 0 };

        function getScale() {
            const dw = canvas.clientWidth, dh = canvas.clientHeight;
            return { scaleX: canvas.width / dw, scaleY: canvas.height / dh };
        }
        function getPos(e) {
            const r = canvas.getBoundingClientRect();
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            const cy = e.touches ? e.touches[0].clientY : e.clientY;
            const { scaleX, scaleY } = getScale();
            return { x: (cx - r.left) * scaleX, y: (cy - r.top) * scaleY };
        }
        function isInsideRect(pos) {
            return rect && pos.x >= rect.x && pos.x <= rect.x + rect.w &&
                   pos.y >= rect.y && pos.y <= rect.y + rect.h;
        }
        function updateCursor(pos) {
            canvas.style.cursor = isInsideRect(pos) ? 'move' : 'crosshair';
        }
        function startDrag(e) {
            e.preventDefault();
            const pos = getPos(e);
            if (isInsideRect(pos)) {
                isMoving = true;
                moveOffset.x = pos.x - rect.x;
                moveOffset.y = pos.y - rect.y;
                dragging = false;
            } else {
                isMoving = false;
                startX = pos.x; startY = pos.y;
                dragging = true;
                rect = null;
            }
        }
        function moveDrag(e) {
            e.preventDefault();
            const pos = getPos(e);
            if (isMoving && rect) {
                let nx = pos.x - moveOffset.x, ny = pos.y - moveOffset.y;
                nx = Math.max(0, Math.min(canvas.width - rect.w, nx));
                ny = Math.max(0, Math.min(canvas.height - rect.h, ny));
                rect.x = nx; rect.y = ny;
                redrawCanvas();
            } else if (dragging) {
                const x = Math.min(startX, pos.x), y = Math.min(startY, pos.y);
                rect = { x, y, w: Math.abs(pos.x - startX), h: Math.abs(pos.y - startY) };
                redrawCanvas();
            } else { updateCursor(pos); }
        }
        function endDrag(e) {
            if (isMoving) isMoving = false;
            if (dragging) { dragging = false; if (rect && (rect.w < 10 || rect.h < 10)) rect = null; }
            redrawCanvas();
        }
        function redrawCanvas() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            if (rect && rect.w > 0 && rect.h > 0) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.save(); ctx.beginPath(); ctx.rect(rect.x, rect.y, rect.w, rect.h); ctx.clip();
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                ctx.restore();
                ctx.strokeStyle = '#2c6e2c'; ctx.lineWidth = 2;
                ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
            }
        }

        canvas.addEventListener('mousedown', startDrag);
        canvas.addEventListener('mousemove', moveDrag);
        canvas.addEventListener('mouseup', endDrag);
        canvas.addEventListener('touchstart', startDrag, { passive: false });
        canvas.addEventListener('touchmove', moveDrag, { passive: false });
        canvas.addEventListener('touchend', endDrag);

        function cleanup() {
            canvas.removeEventListener('mousedown', startDrag);
            canvas.removeEventListener('mousemove', moveDrag);
            canvas.removeEventListener('mouseup', endDrag);
            canvas.removeEventListener('touchstart', startDrag);
            canvas.removeEventListener('touchmove', moveDrag);
            canvas.removeEventListener('touchend', endDrag);
            modal.style.display = 'none';
            URL.revokeObjectURL(img.src);
        }

        cancelBtn.onclick = cleanup;
        doneBtn.onclick = () => {
            if (!rect) {
                if (typeof showToast === 'function') showToast('Please select an area first', 'error');
                return;
            }
            const sox = img.naturalWidth / canvas.width, soy = img.naturalHeight / canvas.height;
            const cropX = rect.x * sox, cropY = rect.y * soy, cropW = rect.w * sox, cropH = rect.h * soy;
            const outCanvas = document.createElement('canvas');
            outCanvas.width = cropW; outCanvas.height = cropH;
            const outCtx = outCanvas.getContext('2d');
            outCtx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
            outCanvas.toBlob(blob => {
                const croppedFile = new File([blob], file.name || 'cropped.jpg', {
                    type: blob.type || 'image/jpeg', lastModified: Date.now()
                });
                const currentId = window.accountImages[accountId][index];
                window.imageRegistry[currentId] = croppedFile;
                renderThumbnails(accountId);
                refreshTwitterFromBluesky(accountId);
                if (accountId == 1) unlockSfwTwitterIfNeeded();
                if (typeof showToast === 'function') showToast('Image cropped!', 'success');
                cleanup();
            }, file.type || 'image/jpeg', 0.92);
        };
        modal.addEventListener('click', (e) => { if (e.target === modal) cleanup(); });
    }

    // ---------- Setup Dropzones ----------
    function setupDropzones() {
        document.querySelectorAll('.dropzone[data-account]').forEach(dz => {
            const accountId = dz.dataset.account;
            if (!accountId) return;
            dz.addEventListener('click', () => {
                const input = document.createElement('input');
                input.type = 'file'; input.multiple = true; input.accept = 'image/*';
                input.onchange = () => {
                    if (input.files.length) {
                        const files = Array.from(input.files).filter(f => f.type.startsWith('image/'));
                        files.forEach(f => {
                            const id = addImage(f);
                            window.accountImages[accountId].push(id);
                        });
                        renderThumbnails(accountId);
                        refreshTwitterFromBluesky(accountId);
                        // Unlock SFW Twitter when new images are added to SFW Bluesky
                        if (accountId == 1) unlockSfwTwitterIfNeeded();
                        if (typeof showToast === 'function') showToast(`+${files.length} images added`, 'success');
                    }
                };
                input.click();
            });
            dz.addEventListener('dragover', e => { e.preventDefault(); dz.style.borderColor = '#6a8e3c'; });
            dz.addEventListener('dragleave', () => dz.style.borderColor = '#3a4050');
            dz.addEventListener('drop', e => {
                e.preventDefault();
                dz.style.borderColor = '#3a4050';
                const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                if (files.length) {
                    files.forEach(f => {
                        const id = addImage(f);
                        window.accountImages[accountId].push(id);
                    });
                    renderThumbnails(accountId);
                    refreshTwitterFromBluesky(accountId);
                    if (accountId == 1) unlockSfwTwitterIfNeeded();
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
        const ids = window.accountImages[accountId] || [];
        const images = ids.map(id => window.imageRegistry[id]).filter(Boolean);
        if (!text && images.length === 0) {
            if (typeof showToast === 'function') showToast('Add text or image first', 'error');
            return;
        }
        let statusDiv = document.getElementById(`post-status-${accountId}`);
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.id = `post-status-${accountId}`;
            statusDiv.style.marginTop = '8px'; statusDiv.style.fontSize = '12px';
            postEl.parentNode.appendChild(statusDiv);
        }
        statusDiv.textContent = '⏳ Posting...'; statusDiv.style.color = '#aaa';
        try {
            const formData = new FormData();
            formData.append('account', accountId);
            formData.append('text', text);
            images.forEach(img => formData.append('image', img));
            const res = await fetch('https://bluesky-post-proxy-final.velutinx.workers.dev', {
                method: 'POST', body: formData
            });
            const data = await res.json();
            if (res.ok) {
                statusDiv.textContent = '✅ Posted!'; statusDiv.style.color = '#4caf50';
                if (typeof showToast === 'function') showToast(`Posted to ${accountId == 1 ? 'SFW' : 'NSFW'} account`, 'success');

                // ---- SFW SAFEGUARD: lock SFW Twitter after SFW Bluesky post ----
                if (accountId == 1) {
                    lockSfwTwitter();
                }

                window.accountImages[accountId] = [];
                renderThumbnails(accountId);
                refreshTwitterFromBluesky(accountId);
                // Cascade SFW post to Twitter account 3 (only if not locked – but we already locked it, so this won't fire)
                if (accountId == 1 && typeof window.sendToWorker === 'function') {
                    // Don't auto-post to Twitter; user must manually re-enable
                    // window.sendToWorker(3);
                }
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
    window.postToBluesky = postToBluesky;

    // ---------- Initialize ----------
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

        installCharCounter(post1);
        installCharCounter(post2);

        setupDropzones();
        renderThumbnails(1);
        renderThumbnails(2);

        // ---------- Clear All Cells Button (TWEETER TAB ONLY) ----------
        const clearBtn = document.getElementById('clearAllBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                // Clear ONLY Tweeter tab textareas
                if (masterPost) masterPost.value = '';
                if (post1) post1.value = '';
                if (post2) post2.value = '';
                for (let i = 1; i <= 3; i++) {
                    const tw = document.getElementById(`twitter-post-${i}`);
                    if (tw) {
                        tw.value = '';
                        tw.dispatchEvent(new Event('input'));
                    }
                }
                [post1, post2].forEach(el => el && el.dispatchEvent(new Event('input')));

                // Clear image arrays and registry
                window.accountImages[1] = [];
                window.accountImages[2] = [];
                window.imageRegistry = {};

                // Re-render all Tweeter thumbnails
                if (typeof window.renderBlueskyThumbnails === 'function') {
                    window.renderBlueskyThumbnails(1);
                    window.renderBlueskyThumbnails(2);
                }
                if (typeof window.renderTwitterThumbnails === 'function') {
                    window.renderTwitterThumbnails(1);
                    window.renderTwitterThumbnails(2);
                    window.renderTwitterThumbnails(3);
                }

                // Re-enable SFW Twitter button (everything is cleared)
                enableSfwTwitterBtn();

                if (typeof showToast === 'function') showToast('Tweeter cells cleared!', 'info');
            });
        }

        // ---------- Unlock SFW Twitter button when text is typed ----------
        // Monitor SFW Bluesky textarea and SFW Twitter textarea for changes
        [post1, document.getElementById('twitter-post-3')].forEach(el => {
            if (!el) return;
            el.addEventListener('input', () => {
                unlockSfwTwitterIfNeeded();
            });
        });

        // Initial lock state: if SFW Bluesky already has content, unlock Twitter button
        unlockSfwTwitterIfNeeded();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.renderBlueskyThumbnails = renderThumbnails;
})();
