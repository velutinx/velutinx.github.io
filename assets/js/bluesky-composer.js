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

    // ---------- State ----------
    window.accountImages = window.accountImages || { 1: [], 2: [] };
    const sortableInstances = { 1: null, 2: null };

    // ---------- DOM Elements ----------
    const masterPost = document.getElementById('masterPost');
    const post1 = document.getElementById('post1');
    const post2 = document.getElementById('post2');
    // transformBtn is absent from the HTML now

    // ---------- Twitter mirror helper ----------
    function getTwitterTargets(blueskyAccountId) {
        if (blueskyAccountId == 1) return [3];          // SFW → Twitter 3
        if (blueskyAccountId == 2) return [1, 2];       // NSFW → Twitter 1 & 2
        return [];
    }

    // Full mirror: copy the entire Bluesky array to each target Twitter account
    function mirrorToTwitter(blueskyAccountId) {
        if (!window.twitterImages || typeof window.renderTwitterThumbnails !== 'function') return;
        const targets = getTwitterTargets(blueskyAccountId);
        const sourceArray = window.accountImages[blueskyAccountId] || [];
        targets.forEach(twId => {
            window.twitterImages[twId] = [...sourceArray];   // completely replace
            window.renderTwitterThumbnails(twId);
        });
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
                    window.accountImages[accountId].splice(idx, 1);
                    renderThumbnails(accountId);
                    mirrorToTwitter(accountId);   // full mirror after removal
                    if (typeof showToast === 'function') showToast('Image removed', 'info');
                };

                wrapper.appendChild(thumb);
                wrapper.appendChild(cropBtn);
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
                    mirrorToTwitter(accountId);   // full mirror after reorder
                    if (typeof showToast === 'function') showToast('Order updated', 'info');
                }
            });
        }, 50);
    }

    // ---------- CROP MODAL (unchanged except mirror call) ----------
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

        // ---------- State ----------
        let dragging = false,
            isMoving = false,
            startX, startY,
            rect = null,
            moveOffset = { x: 0, y: 0 };

        function getScale() {
            const displayWidth = canvas.clientWidth;
            const displayHeight = canvas.clientHeight;
            return {
                scaleX: canvas.width / displayWidth,
                scaleY: canvas.height / displayHeight
            };
        }

        function getPos(e) {
            const canvasRect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const rawX = clientX - canvasRect.left;
            const rawY = clientY - canvasRect.top;
            const { scaleX, scaleY } = getScale();
            return {
                x: rawX * scaleX,
                y: rawY * scaleY
            };
        }

        function isInsideRect(pos) {
            return rect &&
                pos.x >= rect.x && pos.x <= rect.x + rect.w &&
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
                startX = pos.x;
                startY = pos.y;
                dragging = true;
                rect = null;
            }
        }

        function moveDrag(e) {
            e.preventDefault();
            const pos = getPos(e);

            if (isMoving && rect) {
                let newX = pos.x - moveOffset.x;
                let newY = pos.y - moveOffset.y;
                newX = Math.max(0, Math.min(canvas.width - rect.w, newX));
                newY = Math.max(0, Math.min(canvas.height - rect.h, newY));
                rect.x = newX;
                rect.y = newY;
                redrawCanvas();
            } else if (dragging) {
                const x = Math.min(startX, pos.x);
                const y = Math.min(startY, pos.y);
                const w = Math.abs(pos.x - startX);
                const h = Math.abs(pos.y - startY);
                rect = { x, y, w, h };
                redrawCanvas();
            } else {
                updateCursor(pos);
            }
        }

        function endDrag(e) {
            if (isMoving) isMoving = false;
            if (dragging) {
                dragging = false;
                if (rect && (rect.w < 10 || rect.h < 10)) rect = null;
            }
            redrawCanvas();
        }

        function redrawCanvas() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            if (rect && rect.w > 0 && rect.h > 0) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.save();
                ctx.beginPath();
                ctx.rect(rect.x, rect.y, rect.w, rect.h);
                ctx.clip();
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                ctx.restore();

                ctx.strokeStyle = '#2c6e2c';
                ctx.lineWidth = 2;
                ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
            }
        }

        // Attach events
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

            const scaleOrigX = img.naturalWidth / canvas.width;
            const scaleOrigY = img.naturalHeight / canvas.height;
            const cropX = rect.x * scaleOrigX;
            const cropY = rect.y * scaleOrigY;
            const cropW = rect.w * scaleOrigX;
            const cropH = rect.h * scaleOrigY;

            const outCanvas = document.createElement('canvas');
            outCanvas.width = cropW;
            outCanvas.height = cropH;
            const outCtx = outCanvas.getContext('2d');
            outCtx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

            outCanvas.toBlob(blob => {
                const croppedFile = new File([blob], file.name || 'cropped.jpg', {
                    type: blob.type || 'image/jpeg',
                    lastModified: Date.now()
                });
                window.accountImages[accountId][index] = croppedFile;
                renderThumbnails(accountId);
                mirrorToTwitter(accountId);   // full mirror after crop
                if (typeof showToast === 'function') showToast('Image cropped!', 'success');
                cleanup();
            }, file.type || 'image/jpeg', 0.92);
        };

        modal.addEventListener('click', (e) => {
            if (e.target === modal) cleanup();
        });
    }

    // ---------- Setup Dropzones ----------
    function setupDropzones() {
        document.querySelectorAll('.dropzone[data-account]').forEach(dz => {
            const accountId = dz.dataset.account;
            if (!accountId) return;

            dz.addEventListener('click', () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = true;
                input.accept = 'image/*';
                input.onchange = () => {
                    if (input.files.length) {
                        const imgFiles = Array.from(input.files).filter(f => f.type.startsWith('image/'));
                        window.accountImages[accountId].push(...imgFiles);
                        renderThumbnails(accountId);
                        mirrorToTwitter(accountId);   // full mirror after add
                        if (typeof showToast === 'function') showToast(`+${imgFiles.length} images added`, 'success');
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
                    mirrorToTwitter(accountId);   // full mirror after drop
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
                mirrorToTwitter(accountId);   // clear Twitter mirrors
                // cascade SFW post to Twitter
                if (accountId == 1 && typeof window.sendToWorker === 'function') {
                    window.sendToWorker(3);
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

        // Master mirroring is now handled by twitter-composer.js

        setupDropzones();
        renderThumbnails(1);
        renderThumbnails(2);
        // initial mirror
        mirrorToTwitter(1);
        mirrorToTwitter(2);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.renderBlueskyThumbnails = renderThumbnails;
})();
