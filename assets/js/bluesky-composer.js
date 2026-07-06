// ========== bluesky-composer.js ==========

(function() {
    'use strict';

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

    window.imageRegistry = window.imageRegistry || {};

    function addImage(file) {
        const id = Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 6);
        window.imageRegistry[id] = file;
        return id;
    }

    window.accountImages = window.accountImages || { 1: [], 2: [] };
    window.twitterImageIds = window.twitterImageIds || { 1: [], 2: [], 3: [] };

    const sortableInstances = { 1: null, 2: null };
    const masterPost = document.getElementById('masterPost');
    const post1 = document.getElementById('post1');
    const post2 = document.getElementById('post2');
    // ---------- Watermark images (loaded via CORS proxy) ----------
    const PROXY_BASE = 'https://watermark-worker.velutinx.workers.dev/proxy?url=';
    const CENTER_RAW_URL = 'https://www.velutinx.com/images/Watermark/Rotated Watermark.png';
    const CORNER_RAW_URL = 'https://www.velutinx.com/images/Watermark/Watermark Corner.png';
    const CENTER_WM_URL = PROXY_BASE + encodeURIComponent(CENTER_RAW_URL);
    const CORNER_WM_URL = PROXY_BASE + encodeURIComponent(CORNER_RAW_URL);

    let centerWmImg = null;
    let cornerWmImg = null;

    function loadImageDirect(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = url;
        });
    }

    async function loadWatermarks() {
        try {
            [centerWmImg, cornerWmImg] = await Promise.all([
                loadImageDirect(CENTER_WM_URL),
                loadImageDirect(CORNER_WM_URL)
            ]);
            if (centerWmImg && cornerWmImg) {
                console.log('✅ Watermarks loaded successfully');
            } else {
                console.warn('⚠️ Watermarks failed to load – images will be uploaded without watermarks.');
            }
        } catch (err) {
            console.warn('⚠️ Watermarks failed to load – images will be uploaded without watermarks.');
        }
    }

    function applyWatermark(file) {
        return new Promise((resolve) => {
            if (!centerWmImg || !cornerWmImg) {
                resolve(file);
                return;
            }

            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, img.width, img.height);
                ctx.globalAlpha = 0.20;
                const centerX = (img.width - centerWmImg.width) / 2;
                const centerY = (img.height - centerWmImg.height) / 2;
                ctx.drawImage(centerWmImg, centerX, centerY);
                ctx.globalAlpha = 1.0;
                const cornerX = img.width - cornerWmImg.width - 70;
                const cornerY = 30;
                ctx.drawImage(cornerWmImg, cornerX, cornerY);
                canvas.toBlob(async blob => {
                    const resizedBlob = await ensureSizeLimit(blob);
                    const watermarkedFile = new File([resizedBlob], file.name || 'image.jpg', {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    });
                    resolve(watermarkedFile);
                }, 'image/jpeg', 0.92);
            };
            img.onerror = () => resolve(file);
            img.src = URL.createObjectURL(file);
        });
    }

    async function ensureSizeLimit(blob, maxBytes = 1000 * 1024) {
        if (blob.size <= maxBytes) return blob;

        const img = await createImageBitmap(blob);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        for (let quality = 0.85; quality >= 0.5; quality -= 0.1) {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const newBlob = await new Promise(resolve =>
                canvas.toBlob(resolve, 'image/jpeg', quality)
            );
            if (newBlob.size <= maxBytes) return newBlob;
        }

        let scale = 0.9;
        while (scale > 0.2) {
            canvas.width = Math.floor(img.width * scale);
            canvas.height = Math.floor(img.height * scale);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const newBlob = await new Promise(resolve =>
                canvas.toBlob(resolve, 'image/jpeg', 0.8)
            );
            if (newBlob.size <= maxBytes) return newBlob;
            scale -= 0.1;
        }

        canvas.width = 800;
        canvas.height = Math.floor(800 * (img.height / img.width));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.7));
    }

    function uploadToR2(blob, filename) {
        const formData = new FormData();
        formData.append('image', blob, filename || 'watermarked.jpg');
        fetch('https://watermark-worker.velutinx.workers.dev/upload', {
            method: 'POST',
            body: formData
        }).catch(err => console.warn('R2 upload failed:', err));
    }

    function getSfwTwitterBtn() {
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
        window.twitterImageIds[3] = [];
        if (typeof window.renderTwitterThumbnails === 'function') {
            window.renderTwitterThumbnails(3);
        }
    }
    function lockSfwTwitter() {
        clearSfwTwitter();
        disableSfwTwitterBtn();
    }
    function unlockSfwTwitterIfNeeded() {
        const twText = (document.getElementById('twitter-post-3')?.value || '').trim();
        const bsText = (post1?.value || '').trim();
        const bsImages = window.accountImages[1]?.length || 0;
        if (twText || bsText || bsImages) {
            enableSfwTwitterBtn();
        }
    }

    function refreshTwitterFromBluesky(blueskyAccountId) {
        if (typeof window.renderTwitterThumbnails !== 'function') return;
        if (blueskyAccountId == 1) {
            window.twitterImageIds[3] = [...window.accountImages[1]];
            window.renderTwitterThumbnails(3);
        } else if (blueskyAccountId == 2) {
            window.twitterImageIds[1] = [...window.accountImages[2]];
            window.twitterImageIds[2] = [...window.accountImages[2]];
            window.renderTwitterThumbnails(1);
            window.renderTwitterThumbnails(2);
        }
    }

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
                    if (accountId == 2) {
                        [1, 2].forEach(twId => {
                            const twPos = window.twitterImageIds[twId].indexOf(removedId);
                            if (twPos !== -1) window.twitterImageIds[twId].splice(twPos, 1);
                        });
                    } else if (accountId == 1) {
                        const twPos = window.twitterImageIds[3].indexOf(removedId);
                        if (twPos !== -1) window.twitterImageIds[3].splice(twPos, 1);
                    }
                    let inUse = false;
                    for (const arr of Object.values(window.accountImages)) {
                        if (arr.includes(removedId)) { inUse = true; break; }
                    }
                    if (!inUse) delete window.imageRegistry[removedId];
                }
                renderThumbnails(accountId);
                if (accountId == 1) {
                    window.renderTwitterThumbnails(3);
                } else if (accountId == 2) {
                    window.renderTwitterThumbnails(1);
                    window.renderTwitterThumbnails(2);
                    if (typeof window.unlockTwitter12IfNeeded === 'function') {
                        window.unlockTwitter12IfNeeded();
                    }
                }
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
                    if (accountId == 2) {
                        window.twitterImageIds[1] = [...newOrder];
                        window.twitterImageIds[2] = [...newOrder];
                        window.renderTwitterThumbnails(1);
                        window.renderTwitterThumbnails(2);
                        if (typeof window.unlockTwitter12IfNeeded === 'function') {
                            window.unlockTwitter12IfNeeded();
                        }
                    } else if (accountId == 1) {
                        window.twitterImageIds[3] = [...newOrder];
                        window.renderTwitterThumbnails(3);
                    }
                    if (typeof showToast === 'function') showToast('Order updated', 'info');
                }
            });
        }, 50);
    }

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
        doneBtn.onclick = async () => {
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
            outCanvas.toBlob(async blob => {
                try {
                    const croppedFile = new File([blob], file.name || 'cropped.jpg', {
                        type: blob.type || 'image/jpeg', lastModified: Date.now()
                    });
                    const watermarkedFile = await applyWatermark(croppedFile);
                    const currentId = window.accountImages[accountId][index];
                    window.imageRegistry[currentId] = watermarkedFile;
                    renderThumbnails(accountId);
                    if (accountId == 1) {
                        window.renderTwitterThumbnails(3);
                        unlockSfwTwitterIfNeeded();
                    } else if (accountId == 2) {
                        window.renderTwitterThumbnails(1);
                        window.renderTwitterThumbnails(2);
                        if (typeof window.unlockTwitter12IfNeeded === 'function') {
                            window.unlockTwitter12IfNeeded();
                        }
                    }
                    uploadToR2(watermarkedFile, watermarkedFile.name || 'cropped.jpg');
                    if (typeof showToast === 'function') showToast('Image cropped & watermarked!', 'success');
                } catch (err) {
                    console.error('Watermark after crop failed:', err);
                    const croppedFile = new File([blob], file.name || 'cropped.jpg', {
                        type: blob.type || 'image/jpeg', lastModified: Date.now()
                    });
                    window.imageRegistry[window.accountImages[accountId][index]] = croppedFile;
                    renderThumbnails(accountId);
                }
                cleanup();
            }, file.type || 'image/jpeg', 0.92);
        };
        modal.addEventListener('click', (e) => { if (e.target === modal) cleanup(); });
    }

    function setupDropzones() {
        document.querySelectorAll('.dropzone[data-account]').forEach(dz => {
            const accountId = dz.dataset.account;
            if (!accountId) return;

            dz.addEventListener('click', () => {
                const input = document.createElement('input');
                input.type = 'file'; input.multiple = true; input.accept = 'image/*';
                input.onchange = async () => {
                    if (input.files.length) {
                        const rawFiles = Array.from(input.files).filter(f => f.type.startsWith('image/'));
                        const watermarkedFiles = [];
                        for (const file of rawFiles) {
                            try {
                                const wmFile = await applyWatermark(file);
                                watermarkedFiles.push(wmFile);
                                uploadToR2(wmFile, file.name);
                            } catch (err) {
                                console.warn('Watermarking failed for', file.name, err);
                                watermarkedFiles.push(file);
                            }
                        }

                        watermarkedFiles.forEach(f => {
                            const id = addImage(f);
                            window.accountImages[accountId].push(id);
                            if (accountId == 2) {
                                window.twitterImageIds[1].push(id);
                                window.twitterImageIds[2].push(id);
                            } else if (accountId == 1) {
                                window.twitterImageIds[3].push(id);
                            }
                        });

                        renderThumbnails(accountId);
                        if (accountId == 2) {
                            window.renderTwitterThumbnails(1);
                            window.renderTwitterThumbnails(2);
                            if (typeof window.unlockTwitter12IfNeeded === 'function') {
                                window.unlockTwitter12IfNeeded();
                            }
                        } else if (accountId == 1) {
                            window.renderTwitterThumbnails(3);
                            unlockSfwTwitterIfNeeded();
                        }
                        if (typeof showToast === 'function') showToast(`+${watermarkedFiles.length} images added`, 'success');
                    }
                };
                input.click();
            });

            dz.addEventListener('dragover', e => { e.preventDefault(); dz.style.borderColor = '#6a8e3c'; });
            dz.addEventListener('dragleave', () => dz.style.borderColor = '#3a4050');
            dz.addEventListener('drop', async e => {
                e.preventDefault();
                dz.style.borderColor = '#3a4050';
                const rawFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                const watermarkedFiles = [];
                for (const file of rawFiles) {
                    try {
                        const wmFile = await applyWatermark(file);
                        watermarkedFiles.push(wmFile);
                        uploadToR2(wmFile, file.name);
                    } catch (err) {
                        console.warn('Watermarking failed for', file.name, err);
                        watermarkedFiles.push(file);
                    }
                }

                watermarkedFiles.forEach(f => {
                    const id = addImage(f);
                    window.accountImages[accountId].push(id);
                    if (accountId == 2) {
                        window.twitterImageIds[1].push(id);
                        window.twitterImageIds[2].push(id);
                    } else if (accountId == 1) {
                        window.twitterImageIds[3].push(id);
                    }
                });

                renderThumbnails(accountId);
                if (accountId == 2) {
                    window.renderTwitterThumbnails(1);
                    window.renderTwitterThumbnails(2);
                    if (typeof window.unlockTwitter12IfNeeded === 'function') {
                        window.unlockTwitter12IfNeeded();
                    }
                } else if (accountId == 1) {
                    window.renderTwitterThumbnails(3);
                    unlockSfwTwitterIfNeeded();
                }
                if (typeof showToast === 'function') showToast(`${watermarkedFiles.length} dropped`, 'success');
            });
        });
    }

    function getUtf8Bytes(str) {
        return new TextEncoder().encode(str);
    }

    function charIndexToByteIndex(text, charIndex) {
        const bytes = getUtf8Bytes(text.slice(0, charIndex));
        return bytes.length;
    }

    function extractLinks(text) {
        const links = [];
        const urlRegex = /https?:\/\/[^\s<>"(){}|\\^`[\]]+/g;
        let match;
        while ((match = urlRegex.exec(text)) !== null) {
            links.push({
                start: match.index,
                end: match.index + match[0].length,
                url: match[0],
            });
        }
        return links;
    }

    function extractHashtags(text, links) {
        const hashtags = [];
        const regex = /#([^\s#@]+)/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
            const start = match.index;
            const end = start + match[0].length;
            const insideLink = links.some(link => start >= link.start && end <= link.end);
            if (!insideLink) {
                hashtags.push({ start, end, tag: match[1] });
            }
        }
        return hashtags;
    }

    function buildFacets(text) {
        const facets = [];
        const links = extractLinks(text);
        for (const { start, end, url } of links) {
            const byteStart = charIndexToByteIndex(text, start);
            const byteEnd = charIndexToByteIndex(text, end);
            facets.push({
                index: { byteStart, byteEnd },
                features: [{ $type: 'app.bsky.richtext.facet#link', uri: url }]
            });
        }
        const hashtags = extractHashtags(text, links);
        for (const { start, end, tag } of hashtags) {
            const byteStart = charIndexToByteIndex(text, start);
            const byteEnd = charIndexToByteIndex(text, end);
            facets.push({
                index: { byteStart, byteEnd },
                features: [{ $type: 'app.bsky.richtext.facet#tag', tag }]
            });
        }
        return facets;
    }

    async function postToBluesky(accountId) {
        const postEl = document.getElementById(`post${accountId}`);
        if (!postEl) {
            console.error(`❌ Element #post${accountId} not found`);
            return;
        }
        const text = postEl.value.trim();
        const ids = window.accountImages[accountId] || [];
        const images = ids.map(id => window.imageRegistry[id]).filter(Boolean);

        if (!text && images.length === 0) {
            console.warn('No text and no images — aborting');
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

            const facets = buildFacets(text);
            formData.append('facets', JSON.stringify(facets));

            images.forEach((img, i) => {
                if (!(img instanceof File)) {
                    console.error(`❌ Image at index ${i} is not a File`, img);
                    throw new Error('Invalid image file');
                }
                formData.append('image', img, img.name || 'image.jpg');
            });

            const res = await fetch('https://bluesky-post-proxy-final.velutinx.workers.dev', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (res.ok) {
                statusDiv.textContent = '✅ Posted!'; statusDiv.style.color = '#4caf50';
                if (typeof showToast === 'function') showToast(`Posted to ${accountId == 1 ? 'SFW' : 'NSFW'} account`, 'success');

                if (accountId == 1) {
                    if (typeof window.sendToWorker === 'function') {
                        window.sendToWorker(3);
                    }
                    window.accountImages[1] = [];
                    renderThumbnails(1);
                    lockSfwTwitter();
                } else {
                    window.accountImages[accountId] = [];
                    renderThumbnails(accountId);
                }
                setTimeout(() => statusDiv.textContent = '', 2500);
            } else {
                statusDiv.textContent = `❌ ${data.error || 'failed'}`;
                console.error('Bluesky post error:', data);
                if (typeof showToast === 'function') showToast(`Error: ${data.error || 'server error'}`, 'error');
            }
        } catch (err) {
            console.error('❌ Bluesky fetch error:', err);
            statusDiv.textContent = `❌ ${err.message}`;
            if (typeof showToast === 'function') showToast(`Network error: ${err.message}`, 'error');
        }
    }
    window.postToBluesky = postToBluesky;

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

        const autoResize = (ta) => {
            if (!ta) return;
            ta.style.height = 'auto';
            ta.style.height = (ta.scrollHeight + 2) + 'px';
        };
        post1.addEventListener('input', () => autoResize(post1));
        post2.addEventListener('input', () => autoResize(post2));
        autoResize(post1);
        autoResize(post2);

        const tweeterTabBtn = document.querySelector('.tab-button[data-tab="bluesky"]');
        if (tweeterTabBtn) {
            tweeterTabBtn.addEventListener('click', () => {
                setTimeout(() => {
                    autoResize(post1);
                    autoResize(post2);
                    if (masterPost) {
                        masterPost.style.height = 'auto';
                        masterPost.style.height = (masterPost.scrollHeight + 2) + 'px';
                    }
                }, 0);
            });
        }

        loadWatermarks().then(() => {
            setupDropzones();
            renderThumbnails(1);
            renderThumbnails(2);

            const clearBtn = document.getElementById('clearAllBtn');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
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
                    window.accountImages[1] = [];
                    window.accountImages[2] = [];
                    window.twitterImageIds[1] = [];
                    window.twitterImageIds[2] = [];
                    window.twitterImageIds[3] = [];
                    window.imageRegistry = {};
                    if (typeof window.renderBlueskyThumbnails === 'function') {
                        window.renderBlueskyThumbnails(1);
                        window.renderBlueskyThumbnails(2);
                    }
                    if (typeof window.renderTwitterThumbnails === 'function') {
                        window.renderTwitterThumbnails(1);
                        window.renderTwitterThumbnails(2);
                        window.renderTwitterThumbnails(3);
                    }
                    enableSfwTwitterBtn();
                    if (typeof window.forceEnableTw12Buttons === 'function') {
                        window.forceEnableTw12Buttons();
                    }
                    if (typeof showToast === 'function') showToast('Tweeter cells cleared!', 'info');
                });
            }

            [post1, document.getElementById('twitter-post-3')].forEach(el => {
                if (!el) return;
                el.addEventListener('input', unlockSfwTwitterIfNeeded);
            });
            const tw12Textareas = [
                post2,
                document.getElementById('twitter-post-1'),
                document.getElementById('twitter-post-2')
            ].filter(Boolean);
            tw12Textareas.forEach(el => {
                if (el) el.addEventListener('input', () => {
                    if (typeof window.unlockTwitter12IfNeeded === 'function') {
                        window.unlockTwitter12IfNeeded();
                    }
                });
            });

            unlockSfwTwitterIfNeeded();
            if (typeof window.unlockTwitter12IfNeeded === 'function') {
                window.unlockTwitter12IfNeeded();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.renderBlueskyThumbnails = renderThumbnails;
})();
