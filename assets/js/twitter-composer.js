// velutinx.github.io/assets/js/twitter-composer.js

(function() {
    'use strict';

    function showToast(msg, type = 'success') {
        let c = document.getElementById('toast-container');
        if (!c) { c = document.createElement('div'); c.id = 'toast-container';
            c.style.cssText = 'position:fixed; top:20px; right:20px; z-index:9999;';
            document.body.appendChild(c); }
        const t = document.createElement('div'); t.className = `toast-notification ${type}`;
        t.textContent = msg; c.appendChild(t); setTimeout(() => t.remove(), 3000);
    }

    const TWITTER_MAX = 280;
    function updateTwitterCounter(textarea) {
        const counter = textarea._wc;
        if (!counter) return;
        const remaining = TWITTER_MAX - textarea.value.length;
        counter.textContent = `Characters: ${remaining}`;
        counter.style.color = remaining >= 0 ? '#4caf50' : '#f44336';
        counter.style.fontWeight = remaining >= 0 ? 'normal' : 'bold';
    }
    function installTwitterCounter(textarea) {
        if (!textarea) return;
        const parent = textarea.parentNode;
        let counter = parent.querySelector('.word-counter');
        if (!counter) { counter = document.createElement('div'); counter.className = 'word-counter';
            parent.insertBefore(counter, textarea.nextSibling); }
        textarea._wc = counter;
        textarea.addEventListener('input', () => updateTwitterCounter(textarea));
        updateTwitterCounter(textarea);
    }

    // Master mirroring
    const master = document.getElementById('masterPost');
    const allChildren = [
        document.getElementById('post1'), document.getElementById('post2'),
        document.getElementById('twitter-post-1'), document.getElementById('twitter-post-2'),
        document.getElementById('twitter-post-3')
    ].filter(Boolean);
    if (master) {
        master.addEventListener('input', () => {
            allChildren.forEach(ta => { ta.value = master.value; });
            allChildren.forEach(ta => ta.dispatchEvent(new Event('input')));
        });
    }

    // Mapping Twitter → Bluesky source
    const twToBluesky = { 1: 2, 2: 2, 3: 1 };

    // Twitter thumbnails use the same image IDs as the Bluesky arrays.
    const twitterSortables = {};
    const renderTimers = { 1: null, 2: null, 3: null };

    function renderTwitterThumbnails(twAccId) {
        const container = document.getElementById(`tw-container-${twAccId}`);
        if (!container) return;
        if (renderTimers[twAccId]) { clearTimeout(renderTimers[twAccId]); renderTimers[twAccId] = null; }
        renderTimers[twAccId] = setTimeout(() => {
            renderTimers[twAccId] = null;
            container.style.display = 'flex'; container.style.flexWrap = 'wrap'; container.style.gap = '8px';
            if (twitterSortables[twAccId]) { twitterSortables[twAccId].destroy(); twitterSortables[twAccId] = null; }

            const blueskySrcId = twToBluesky[twAccId];
            const sourceIds = (blueskySrcId && window.accountImages?.[blueskySrcId]) || [];
            container.innerHTML = '';

            sourceIds.forEach((id, idx) => {
                const file = window.imageRegistry?.[id];
                if (!file) return;
                const url = URL.createObjectURL(file);

                const wrapper = document.createElement('div');
                wrapper.className = 'cf-selected-item';
                wrapper.dataset.index = idx;
                wrapper.dataset.id = id;
                wrapper.dataset.twAcc = twAccId;
                wrapper.dataset.bsSrc = blueskySrcId;

                const thumb = document.createElement('img');
                thumb.className = 'cf-selected-thumb';
                thumb.src = url;
                thumb.onload = () => URL.revokeObjectURL(url);
                thumb.onerror = () => URL.revokeObjectURL(url);

                const removeBtn = document.createElement('button');
                removeBtn.className = 'cf-remove-btn';
                removeBtn.textContent = '✕';
                removeBtn.onclick = (ev) => {
                    ev.stopPropagation();
                    const wrapperEl = ev.target.closest('.cf-selected-item');
                    if (!wrapperEl) return;
                    const rid = wrapperEl.dataset.id;
                    const srcId = parseInt(wrapperEl.dataset.bsSrc, 10);
                    if (rid && srcId && window.accountImages?.[srcId]) {
                        const pos = window.accountImages[srcId].indexOf(rid);
                        if (pos !== -1) window.accountImages[srcId].splice(pos, 1);
                        // Remove from registry if not used elsewhere
                        let inUse = false;
                        for (const arr of Object.values(window.accountImages)) {
                            if (arr.includes(rid)) { inUse = true; break; }
                        }
                        if (!inUse) delete window.imageRegistry[rid];
                        // Refresh all Bluesky/Twitter views that share this source
                        if (typeof window.renderBlueskyThumbnails === 'function') {
                            window.renderBlueskyThumbnails(srcId);
                        }
                        renderTwitterThumbnails(twAccId);
                        // Also refresh the other Twitter card that shares the same source
                        if (srcId === 2) {
                            const otherTw = twAccId === 1 ? 2 : 1;
                            renderTwitterThumbnails(otherTw);
                        }
                        showToast('Image removed', 'info');
                    }
                };

                wrapper.appendChild(thumb);
                wrapper.appendChild(removeBtn);
                container.appendChild(wrapper);
            });

            setTimeout(() => {
                if (renderTimers[twAccId] !== null) return;
                twitterSortables[twAccId] = new Sortable(container, {
                    animation: 150,
                    handle: '.cf-selected-thumb',
                    ghostClass: 'cf-sortable-ghost',
                    onEnd: function() {
                        const srcId = twToBluesky[twAccId];
                        if (!srcId || !window.accountImages?.[srcId]) return;
                        const newOrder = [];
                        Array.from(container.children).forEach(child => {
                            const id = child.dataset.id;
                            if (id && window.imageRegistry?.[id]) newOrder.push(id);
                        });
                        window.accountImages[srcId] = newOrder;
                        Array.from(container.children).forEach((child, i) => { child.dataset.index = i; });
                        if (typeof window.renderBlueskyThumbnails === 'function') {
                            window.renderBlueskyThumbnails(srcId);
                        }
                        // Refresh all Twitter cards that use this source
                        for (const [twId, bsId] of Object.entries(twToBluesky)) {
                            if (bsId === srcId) renderTwitterThumbnails(parseInt(twId));
                        }
                        showToast('Order updated', 'info');
                    }
                });
            }, 60);
        }, 20);
    }

    // Twitter dropzones (add to the correct Bluesky source)
    function setupTwitterDropzones() {
        for (let twId = 1; twId <= 3; twId++) {
            const dz = document.getElementById(`tw-dz-${twId}`);
            if (!dz) continue;
            const srcId = twToBluesky[twId];
            if (!srcId) continue;
            dz.addEventListener('click', () => {
                const input = document.createElement('input');
                input.type = 'file'; input.multiple = true; input.accept = 'image/*';
                input.onchange = () => {
                    if (input.files.length) {
                        const files = Array.from(input.files).filter(f => f.type.startsWith('image/'));
                        files.forEach(f => {
                            const id = Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 6);
                            window.imageRegistry = window.imageRegistry || {};
                            window.imageRegistry[id] = f;
                            if (!window.accountImages) window.accountImages = {};
                            if (!window.accountImages[srcId]) window.accountImages[srcId] = [];
                            window.accountImages[srcId].push(id);
                        });
                        if (typeof window.renderBlueskyThumbnails === 'function') {
                            window.renderBlueskyThumbnails(srcId);
                        }
                        renderTwitterThumbnails(twId);
                        // Also refresh the other Twitter card if it shares the same source
                        if (srcId === 2) {
                            const other = twId === 1 ? 2 : 1;
                            renderTwitterThumbnails(other);
                        }
                        showToast(`+${files.length} image(s) added`, 'success');
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
                        const id = Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 6);
                        window.imageRegistry = window.imageRegistry || {};
                        window.imageRegistry[id] = f;
                        if (!window.accountImages) window.accountImages = {};
                        if (!window.accountImages[srcId]) window.accountImages[srcId] = [];
                        window.accountImages[srcId].push(id);
                    });
                    if (typeof window.renderBlueskyThumbnails === 'function') {
                        window.renderBlueskyThumbnails(srcId);
                    }
                    renderTwitterThumbnails(twId);
                    if (srcId === 2) {
                        const other = twId === 1 ? 2 : 1;
                        renderTwitterThumbnails(other);
                    }
                    showToast(`${files.length} dropped`, 'success');
                }
            });
        }
    }

    async function sendToWorker(accId) {
        const statusEl = document.getElementById(`tw-status-${accId}`);
        const textarea = document.getElementById(`twitter-post-${accId}`);
        if (!textarea) return;
        const text = textarea.value;
        const srcId = twToBluesky[accId];
        const sourceIds = (srcId && window.accountImages?.[srcId]) || [];
        const images = sourceIds.map(id => window.imageRegistry?.[id]).filter(Boolean);
        statusEl.textContent = '⏳ Posting...';
        const formData = new FormData();
        formData.append('accId', accId.toString());
        formData.append('text', text);
        images.forEach(img => formData.append('images', img));
        try {
            const res = await fetch('https://twitter-post.velutinx.workers.dev', {
                method: 'POST', body: formData
            });
            const data = await res.json();
            if (data.success && data.data?.data?.id) {
                statusEl.textContent = '✅ Posted!'; statusEl.style.color = '#4CAF50';
                showToast(data.retweetSuccess ? 'Tweet posted & retweeted!' : 'Tweet posted!', 'success');
                // Clear the source array and refresh
                if (srcId && window.accountImages) {
                    window.accountImages[srcId] = [];
                    if (typeof window.renderBlueskyThumbnails === 'function') {
                        window.renderBlueskyThumbnails(srcId);
                    }
                }
                renderTwitterThumbnails(accId);
            } else {
                statusEl.textContent = '❌ ' + (data.error || data.detail || 'Unknown');
                statusEl.style.color = '#f44336';
                console.error(data);
            }
        } catch (err) {
            statusEl.textContent = '❌ Connection Failed'; statusEl.style.color = '#f44336';
        }
    }
    window.sendToWorker = sendToWorker;

    function init() {
        for (let i = 1; i <= 3; i++) {
            installTwitterCounter(document.getElementById(`twitter-post-${i}`));
        }
        if (!window.imageRegistry) window.imageRegistry = {};
        if (!window.accountImages) window.accountImages = { 1: [], 2: [] };
        setupTwitterDropzones();
        renderTwitterThumbnails(1);
        renderTwitterThumbnails(2);
        renderTwitterThumbnails(3);
        window.renderTwitterThumbnails = renderTwitterThumbnails;
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
