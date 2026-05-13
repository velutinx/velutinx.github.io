// velutinx.github.io/assets/js/twitter-composer.js
// Handles master mirroring + Twitter image/posting

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

    // ---------- Twitter image storage ----------
    window.twitterImages = { 1: [], 2: [], 3: [] };
    const twitterSortables = {};

    const renderTimers = { 1: null, 2: null, 3: null };

    function renderTwitterThumbnails(accId) {
        const container = document.getElementById(`tw-container-${accId}`);
        if (!container) return;

        // Cancel any pending render
        if (renderTimers[accId]) {
            clearTimeout(renderTimers[accId]);
            renderTimers[accId] = null;
        }

        // Debounce: schedule a render after 20ms
        renderTimers[accId] = setTimeout(() => {
            renderTimers[accId] = null;

            container.style.display = 'flex';
            container.style.flexWrap = 'wrap';
            container.style.gap = '8px';

            if (twitterSortables[accId]) {
                twitterSortables[accId].destroy();
                twitterSortables[accId] = null;
            }

            const files = window.twitterImages[accId] || [];
            container.innerHTML = '';

            // Create thumbnails synchronously (no FileReader)
            files.forEach((file, idx) => {
                const url = URL.createObjectURL(file);

                const wrapper = document.createElement('div');
                wrapper.className = 'cf-selected-item';
                wrapper.dataset.index = idx;   // initial index

                const thumb = document.createElement('img');
                thumb.className = 'cf-selected-thumb';
                thumb.src = url;

                // Release the blob URL when the image is loaded or fails
                thumb.onload = () => URL.revokeObjectURL(url);
                thumb.onerror = () => URL.revokeObjectURL(url);

                const removeBtn = document.createElement('button');
                removeBtn.className = 'cf-remove-btn';
                removeBtn.textContent = '✕';
                // 🔧 Use the current DOM index, not the captured idx
                removeBtn.onclick = (ev) => {
                    ev.stopPropagation();
                    const wrapperEl = ev.target.closest('.cf-selected-item');
                    if (!wrapperEl) return;
                    const currentIndex = parseInt(wrapperEl.dataset.index, 10);
                    if (!isNaN(currentIndex) && window.twitterImages[accId][currentIndex]) {
                        window.twitterImages[accId].splice(currentIndex, 1);
                        renderTwitterThumbnails(accId);
                    }
                };

                wrapper.appendChild(thumb);
                wrapper.appendChild(removeBtn);
                container.appendChild(wrapper);
            });

            // Install Sortable after a short delay so thumbnails are in place
            setTimeout(() => {
                // If another render was triggered in the meantime, skip
                if (renderTimers[accId] !== null) return;

                twitterSortables[accId] = new Sortable(container, {
                    animation: 150,
                    handle: '.cf-selected-thumb',
                    ghostClass: 'cf-sortable-ghost',
                    onEnd: function() {
                        // Rebuild array from current DOM order
                        const newOrder = [];
                        Array.from(container.children).forEach(child => {
                            const fileIndex = parseInt(child.dataset.index, 10);
                            if (!isNaN(fileIndex) && window.twitterImages[accId][fileIndex]) {
                                newOrder.push(window.twitterImages[accId][fileIndex]);
                            }
                        });
                        window.twitterImages[accId] = newOrder;
                        // Update dataset indices to reflect the new order
                        Array.from(container.children).forEach((child, i) => {
                            child.dataset.index = i;
                        });
                    }
                });
            }, 60);
        }, 20);
    }

    // Dropzones for Twitter
    function setupTwitterDropzones() {
        for (let accId = 1; accId <= 3; accId++) {
            const dz = document.getElementById(`tw-dz-${accId}`);
            if (!dz) continue;
            dz.addEventListener('click', () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = true;
                input.accept = 'image/*';
                input.onchange = () => {
                    if (input.files.length) {
                        window.twitterImages[accId].push(...Array.from(input.files).filter(f => f.type.startsWith('image/')));
                        renderTwitterThumbnails(accId);
                        showToast(`+${input.files.length} image(s) added`, 'success');
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
                    window.twitterImages[accId].push(...files);
                    renderTwitterThumbnails(accId);
                    showToast(`${files.length} dropped`, 'success');
                }
            });
        }
    }

    // Posting to Twitter
    async function sendToWorker(accId) {
        const statusEl = document.getElementById(`tw-status-${accId}`);
        const textarea = document.getElementById(`twitter-post-${accId}`);
        if (!textarea) return;
        const text = textarea.value;
        const images = window.twitterImages[accId] || [];
        statusEl.textContent = '⏳ Posting...';
        const formData = new FormData();
        formData.append('accId', accId.toString());
        formData.append('text', text);
        images.forEach(img => formData.append('images', img));
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
                window.twitterImages[accId] = [];
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

    // Init
    function init() {
        for (let i = 1; i <= 3; i++) {
            installTwitterCounter(document.getElementById(`twitter-post-${i}`));
        }
        setupTwitterDropzones();
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
