// velutinx.github.io/assets/js/bluesky-composer.js

(function() {
    'use strict';

    // ---------- Character Counter ----------
    const CHARS_MAX = 300;

    function updateCharCounter(textarea) {
        const counter = textarea._wc;
        if (!counter) return;
        const remaining = CHARS_MAX - textarea.value.length;
        counter.textContent = `Characters remaining: ${remaining}`;
        counter.style.color = remaining > 0 ? '#4caf50' : '#f44336';
        counter.style.fontWeight = remaining > 0 ? 'normal' : 'bold';
    }

    // ---------- State ----------
    window.accountImages = window.accountImages || { 1: [], 2: [] };
    const sortableInstances = { 1: null, 2: null };

    // ---------- Twitter mirror helper ----------
    function getTwitterTargets(blueskyAccountId) {
        if (blueskyAccountId == 1) return [3];          // SFW → Twitter 3
        if (blueskyAccountId == 2) return [1, 2];       // NSFW → Twitter 1 & 2
        return [];
    }

    // Full mirror: copy the entire Bluesky array to target Twitter accounts
    function mirrorToTwitter(blueskyAccountId) {
        if (!window.twitterImages || typeof window.renderTwitterThumbnails !== 'function') return;
        const targets = getTwitterTargets(blueskyAccountId);
        const sourceArray = window.accountImages[blueskyAccountId] || [];
        targets.forEach(twId => {
            // Clone the array to break references
            window.twitterImages[twId] = [...sourceArray];
            window.renderTwitterThumbnails(twId);
        });
    }

    // ---------- Render Thumbnails ----------
    function renderThumbnails(accountId) {
        const container = document.querySelector(`.thumbnail-container[data-account="${accountId}"]`);
        if (!container) return;

        // Cleanup Sortable before re-render
        if (sortableInstances[accountId]) {
            sortableInstances[accountId].destroy();
            sortableInstances[accountId] = null;
        }

        const files = window.accountImages[accountId] || [];
        container.innerHTML = '';
        container.style.display = 'flex';
        container.style.flexWrap = 'wrap';
        container.style.gap = '8px';

        files.forEach((file, idx) => {
            const url = URL.createObjectURL(file);
            const wrapper = document.createElement('div');
            wrapper.className = 'cf-selected-item';
            wrapper.dataset.index = idx; // Important for tracking after reorders

            const thumb = document.createElement('img');
            thumb.className = 'cf-selected-thumb';
            thumb.src = url;
            thumb.style.cursor = 'grab';
            
            // Memory management
            thumb.onload = () => URL.revokeObjectURL(url);

            const cropBtn = document.createElement('button');
            cropBtn.className = 'cf-crop-btn';
            cropBtn.innerHTML = '✂️';
            cropBtn.onclick = (ev) => {
                ev.stopPropagation();
                const currentIdx = parseInt(wrapper.dataset.index, 10);
                openCropModal(window.accountImages[accountId][currentIdx], accountId, currentIdx);
            };

            const removeBtn = document.createElement('button');
            removeBtn.className = 'cf-remove-btn';
            removeBtn.textContent = '✕';
            removeBtn.onclick = (ev) => {
                ev.stopPropagation();
                const currentIdx = parseInt(wrapper.dataset.index, 10);
                window.accountImages[accountId].splice(currentIdx, 1);
                renderThumbnails(accountId);
                mirrorToTwitter(accountId);
                if (typeof showToast === 'function') showToast('Image removed', 'info');
            };

            wrapper.appendChild(thumb);
            wrapper.appendChild(cropBtn);
            wrapper.appendChild(removeBtn);
            container.appendChild(wrapper);
        });

        // Initialize Sortable
        setTimeout(() => {
            sortableInstances[accountId] = new Sortable(container, {
                animation: 150,
                handle: '.cf-selected-thumb',
                ghostClass: 'cf-sortable-ghost',
                onEnd: function() {
                    const newOrder = [];
                    // Rebuild array based on current DOM order
                    Array.from(container.children).forEach((child, newIdx) => {
                        const oldIdx = parseInt(child.dataset.index, 10);
                        newOrder.push(window.accountImages[accountId][oldIdx]);
                        child.dataset.index = newIdx; // Update DOM index
                    });
                    window.accountImages[accountId] = newOrder;
                    mirrorToTwitter(accountId);
                    if (typeof showToast === 'function') showToast('Order updated', 'info');
                }
            });
        }, 10);
    }

    // ---------- CROP MODAL ----------
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
            redrawCanvas();
            modal.style.display = 'flex';
        };

        let dragging = false, isMoving = false, startX, startY, rect = null, moveOffset = { x: 0, y: 0 };

        function getScale() { return { scaleX: canvas.width / canvas.clientWidth, scaleY: canvas.height / canvas.clientHeight }; }
        function getPos(e) {
            const canvasRect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const { scaleX, scaleY } = getScale();
            return { x: (clientX - canvasRect.left) * scaleX, y: (clientY - canvasRect.top) * scaleY };
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
                ctx.strokeStyle = '#4caf50'; ctx.lineWidth = 2;
                ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
            }
        }

        canvas.onmousedown = (e) => {
            const pos = getPos(e);
            startX = pos.x; startY = pos.y; dragging = true; rect = null;
        };
        window.onmousemove = (e) => {
            if (!dragging) return;
            const pos = getPos(e);
            rect = { x: Math.min(startX, pos.x), y: Math.min(startY, pos.y), w: Math.abs(pos.x - startX), h: Math.abs(pos.y - startY) };
            redrawCanvas();
        };
        window.onmouseup = () => { dragging = false; };

        function cleanup() { modal.style.display = 'none'; URL.revokeObjectURL(img.src); canvas.onmousedown = null; window.onmousemove = null; }
        cancelBtn.onclick = cleanup;
        doneBtn.onclick = () => {
            if (!rect) return;
            const sX = img.naturalWidth / canvas.width, sY = img.naturalHeight / canvas.height;
            const out = document.createElement('canvas');
            out.width = rect.w * sX; out.height = rect.h * sY;
            out.getContext('2d').drawImage(img, rect.x * sX, rect.y * sY, out.width, out.height, 0, 0, out.width, out.height);
            out.toBlob(blob => {
                const cropped = new File([blob], file.name, { type: file.type });
                window.accountImages[accountId][index] = cropped;
                renderThumbnails(accountId);
                mirrorToTwitter(accountId);
                cleanup();
            }, file.type, 0.92);
        };
    }

    // ---------- Setup Dropzones ----------
    function setupDropzones() {
        document.querySelectorAll('.dropzone[data-account]').forEach(dz => {
            const accountId = dz.dataset.account;
            dz.addEventListener('click', () => {
                const input = document.createElement('input');
                input.type = 'file'; input.multiple = true; input.accept = 'image/*';
                input.onchange = () => {
                    const files = Array.from(input.files).filter(f => f.type.startsWith('image/'));
                    window.accountImages[accountId].push(...files);
                    renderThumbnails(accountId);
                    mirrorToTwitter(accountId);
                };
                input.click();
            });
            dz.addEventListener('dragover', e => { e.preventDefault(); dz.style.borderColor = '#6a8e3c'; });
            dz.addEventListener('dragleave', () => dz.style.borderColor = '#3a4050');
            dz.addEventListener('drop', e => {
                e.preventDefault();
                dz.style.borderColor = '#3a4050';
                const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                window.accountImages[accountId].push(...files);
                renderThumbnails(accountId);
                mirrorToTwitter(accountId);
            });
        });
    }

    async function postToBluesky(accountId) {
        const postEl = document.getElementById(`post${accountId}`);
        const text = postEl.value.trim();
        const images = window.accountImages[accountId] || [];
        if (!text && images.length === 0) return;

        let statusDiv = document.getElementById(`post-status-${accountId}`);
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.id = `post-status-${accountId}`;
            postEl.parentNode.appendChild(statusDiv);
        }
        statusDiv.textContent = '⏳ Posting...';

        try {
            const formData = new FormData();
            formData.append('account', accountId);
            formData.append('text', text);
            images.forEach(img => formData.append('image', img));

            const response = await fetch('https://bluesky-post-proxy-final.velutinx.workers.dev', { method: 'POST', body: formData });
            if (response.ok) {
                statusDiv.textContent = '✅ Posted!';
                window.accountImages[accountId] = [];
                renderThumbnails(accountId);
                mirrorToTwitter(accountId);
                if (accountId == 1 && typeof window.sendToWorker === 'function') window.sendToWorker(3);
                setTimeout(() => statusDiv.textContent = '', 3000);
            }
        } catch (err) { statusDiv.textContent = '❌ Failed'; }
    }
    window.postToBluesky = postToBluesky;

    function init() {
        const p1 = document.getElementById('post1');
        const p2 = document.getElementById('post2');
        const install = (el) => {
            if (!el) return;
            const c = document.createElement('div'); c.className = 'word-counter';
            el.parentNode.insertBefore(c, el.nextSibling); el._wc = c;
            el.addEventListener('input', () => updateCharCounter(el));
            updateCharCounter(el);
        };
        install(p1); install(p2);
        setupDropzones();
        renderThumbnails(1); renderThumbnails(2);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
    window.renderBlueskyThumbnails = renderThumbnails;
})();
