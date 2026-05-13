// velutinx.github.io/assets/js/twitter-composer.js
// Handles master mirroring + Twitter image/posting
// (reads directly from Bluesky image arrays – no separate storage)

(function() {
    'use strict';

    // ---------- Toast ----------
    function showToast(message, type = 'success') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = 'position:fixed; top:20px; right:20px; z-index:9999;';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // ---------- Character counters (280 for Twitter) ----------
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
        if (!counter) {
            counter = document.createElement('div');
            counter.className = 'word-counter';
            parent.insertBefore(counter, textarea.nextSibling);
        }
        textarea._wc = counter;
        textarea.addEventListener('input', () => updateTwitterCounter(textarea));
        updateTwitterCounter(textarea);
    }

    // ---------- Master mirroring ----------
    const master = document.getElementById('masterPost');
    const allChildren = [
        document.getElementById('post1'),
        document.getElementById('post2'),
        document.getElementById('twitter-post-1'),
        document.getElementById('twitter-post-2'),
        document.getElementById('twitter-post-3')
    ].filter(Boolean);

    if (master) {
        master.addEventListener('input', () => {
            allChildren.forEach(ta => { ta.value = master.value; });
            allChildren.forEach(ta => ta.dispatchEvent(new Event('input')));
        });
    }

    // ---------- Mapping: Twitter ID → Bluesky account ID ----------
    const twitterToBlueskyMap = { 1: 2, 2: 2, 3: 1 };

    function getBlueskySourceForTwitter(twitterAccId) {
        const blueskyId = twitterToBlueskyMap[twitterAccId];
        return blueskyId ? window.accountImages?.[blueskyId] : null;
    }

    // ---------- Render Twitter thumbnails from Bluesky arrays ----------
    const twitterSortables = {};
    const renderTimers = { 1: null, 2: null, 3: null };

    function renderTwitterThumbnails(twitterAccId) {
        const container = document.getElementById(`tw-container-${twitterAccId}`);
        if (!container) return;

        // Cancel any pending render
        if (renderTimers[twitterAccId]) {
            clearTimeout(renderTimers[twitterAccId]);
            renderTimers[twitterAccId] = null;
        }

        renderTimers[twitterAccId] = setTimeout(() => {
            renderTimers[twitterAccId] = null;

            container.style.display = 'flex';
            container.style.flexWrap = 'wrap';
            container.style.gap = '8px';

            if (twitterSortables[twitterAccId]) {
                twitterSortables[twitterAccId].destroy();
                twitterSortables[twitterAccId] = null;
            }

            const sourceArray = getBlueskySourceForTwitter(twitterAccId) || [];
            container.innerHTML = '';

            sourceArray.forEach((file, idx) => {
                const url = URL.createObjectURL(file);

                const wrapper = document.createElement('div');
                wrapper.className = 'cf-selected-item';
                wrapper.dataset.index = idx;
                wrapper.dataset.twitterAcc = twitterAccId;
                wrapper.dataset.blueskySource = twitterToBlueskyMap[twitterAccId];

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
                    const currentIndex = parseInt(wrapperEl.dataset.index, 10);
                    const blueskySrcId = parseInt(wrapperEl.dataset.blueskySource, 10);
                    if (!isNaN(currentIndex) && blueskySrcId && window.accountImages?.[blueskySrcId]) {
                        window.accountImages[blueskySrcId].splice(currentIndex, 1);
                        // Refresh the Bluesky thumbnails and this Twitter card
                        if (typeof window.renderBlueskyThumbnails === 'function') {
                            window.renderBlueskyThumbnails(blueskySrcId);
                        }
                        renderTwitterThumbnails(twitterAccId);
                        showToast('Image removed', 'info');
                    }
                };

                wrapper.appendChild(thumb);
                wrapper.appendChild(removeBtn);
                container.appendChild(wrapper);
            });

            setTimeout(() => {
                if (renderTimers[twitterAccId] !== null) return;
                twitterSortables[twitterAccId] = new Sortable(container, {
                    animation: 150,
                    handle: '.cf-selected-thumb',
                    ghostClass: 'cf-sortable-ghost',
                    onEnd: function() {
                        const blueskySrcId = twitterToBlueskyMap[twitterAccId];
                        if (!blueskySrcId || !window.accountImages?.[blueskySrcId]) return;
                        const newOrder = [];
                        Array.from(container.children).forEach(child => {
                            const fileIndex = parseInt(child.dataset.index, 10);
                            if (!isNaN(fileIndex) && window.accountImages[blueskySrcId][fileIndex]) {
                                newOrder.push(window.accountImages[blueskySrcId][fileIndex]);
                            }
                        });
                        window.accountImages[blueskySrcId] = newOrder;
                        // Refresh all thumbnails that use this source
                        if (typeof window.renderBlueskyThumbnails === 'function') {
                            window.renderBlueskyThumbnails(blueskySrcId);
                        }
                        // Re-render all Twitter cards that map to this Bluesky source
                        for (const [twId, bsId] of Object.entries(twitterToBlueskyMap)) {
                            if (bsId === blueskySrcId) {
                                renderTwitterThumbnails(parseInt(twId));
                            }
                        }
                        showToast('Order updated', 'info');
                    }
                });
            }, 60);
        }, 20);
    }

    // ---------- Twitter dropzones (add directly to Bluesky source) ----------
    function setupTwitterDropzones() {
        for (let twAccId = 1; twAccId <= 3; twAccId++) {
            const dz = document.getElementById(`tw-dz-${twAccId}`);
            if (!dz) continue;
            const blueskySrcId = twitterToBlueskyMap[twAccId];
            if (!blueskySrcId) continue;

            dz.addEventListener('click', () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = true;
                input.accept = 'image/*';
                input.onchange = () => {
                    if (input.files.length) {
                        const imgFiles = Array.from(input.files).filter(f => f.type.startsWith('image/'));
                        // Ensure the Bluesky array exists
                        if (!window.accountImages) window.accountImages = {};
                        if (!window.accountImages[blueskySrcId]) window.accountImages[blueskySrcId] = [];
                        window.accountImages[blueskySrcId].push(...imgFiles);
                        // Refresh Bluesky card
                        if (typeof window.renderBlueskyThumbnails === 'function') {
                            window.renderBlueskyThumbnails(blueskySrcId);
                        }
                        // Refresh this Twitter card
                        renderTwitterThumbnails(twAccId);
                        showToast(`+${imgFiles.length} image(s) added`, 'success');
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
                    if (!window.accountImages) window.accountImages = {};
                    if (!window.accountImages[blueskySrcId]) window.accountImages[blueskySrcId] = [];
                    window.accountImages[blueskySrcId].push(...files);
                    if (typeof window.renderBlueskyThumbnails === 'function') {
                        window.renderBlueskyThumbnails(blueskySrcId);
                    }
                    renderTwitterThumbnails(twAccId);
                    showToast(`${files.length} dropped`, 'success');
                }
            });
        }
    }

    // ---------- Posting to Twitter ----------
    async function sendToWorker(accId) {
        const statusEl = document.getElementById(`tw-status-${accId}`);
        const textarea = document.getElementById(`twitter-post-${accId}`);
        if (!textarea) return;
        const text = textarea.value;
        const sourceArray = getBlueskySourceForTwitter(accId) || [];
        statusEl.textContent = '⏳ Posting...';
        const formData = new FormData();
        formData.append('accId', accId.toString());
        formData.append('text', text);
        sourceArray.forEach(img => formData.append('images', img));
        try {
            const res = await fetch('https://twitter-post.velutinx.workers.dev', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success && data.data?.data?.id) {
                statusEl.textContent = '✅ Posted!';
                statusEl.style.color = '#4CAF50';
                showToast(data.retweetSuccess ? 'Tweet posted & retweeted!' : 'Tweet posted!', 'success');
                // Clear the source array
                const blueskySrcId = twitterToBlueskyMap[accId];
                if (blueskySrcId && window.accountImages?.[blueskySrcId]) {
                    window.accountImages[blueskySrcId] = [];
                    if (typeof window.renderBlueskyThumbnails === 'function') {
                        window.renderBlueskyThumbnails(blueskySrcId);
                    }
                }
                renderTwitterThumbnails(accId);
            } else {
                statusEl.textContent = '❌ ' + (data.error || data.detail || 'Unknown');
                statusEl.style.color = '#f44336';
                console.error(data);
            }
        } catch (err) {
            statusEl.textContent = '❌ Connection Failed';
            statusEl.style.color = '#f44336';
        }
    }
    window.sendToWorker = sendToWorker;

    // ---------- Init ----------
    function init() {
        for (let i = 1; i <= 3; i++) {
            installTwitterCounter(document.getElementById(`twitter-post-${i}`));
        }
        setupTwitterDropzones();
        // Ensure Bluesky arrays exist (they'll be created by bluesky-composer.js too)
        if (!window.accountImages) {
            window.accountImages = { 1: [], 2: [] };
        }
        // Initial renders
        renderTwitterThumbnails(1);
        renderTwitterThumbnails(2);
        renderTwitterThumbnails(3);
        window.renderTwitterThumbnails = renderTwitterThumbnails;
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
