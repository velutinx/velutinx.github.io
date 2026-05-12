// velutinx.github.io/assets/js/twitter-composer.js
// Standalone Twitter composer logic (to be merged later)

(function() {
    'use strict';

    // ========== Toast notification ==========
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
        setTimeout(() => { toast.remove(); }, 3000);
    }

    // ========== Character counter (Bluesky style) ==========
    const CHARS_MAX = 280;

    function updateCharCounter(textarea) {
        const counter = textarea._wc;
        if (!counter) return;
        const remaining = CHARS_MAX - textarea.value.length;
        counter.textContent = `Characters remaining: ${remaining}`;
        counter.style.color = remaining >= 0 ? '#4caf50' : '#f44336';
        counter.style.fontWeight = remaining >= 0 ? 'normal' : 'bold';
    }

    function installCharCounter(textarea) {
        if (!textarea) return;
        const parent = textarea.parentNode;
        let counter = parent.querySelector('.word-counter');
        if (!counter) {
            counter = document.createElement('div');
            counter.className = 'word-counter';
            parent.insertBefore(counter, textarea.nextSibling);
        }
        textarea._wc = counter;
        textarea.addEventListener('input', () => updateCharCounter(textarea));
        textarea.addEventListener('keyup', () => updateCharCounter(textarea));
        updateCharCounter(textarea);
    }

    // ========== Image store & thumbnail rendering ==========
    window.accountImages = { 1: [], 2: [], 3: [] };
    const sortableInstances = {};

    function renderThumbnails(accId) {
        const container = document.getElementById(`container-${accId}`);
        if (!container) return;
        container.style.display = 'flex';
        container.style.flexWrap = 'wrap';
        container.style.gap = '8px';

        // Destroy previous Sortable instance
        if (sortableInstances[accId]) {
            sortableInstances[accId].destroy();
            sortableInstances[accId] = null;
        }

        const files = window.accountImages[accId] || [];
        container.innerHTML = '';

        files.forEach((file, idx) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const wrapper = document.createElement('div');
                wrapper.className = 'cf-selected-item';   // same as Bluesky / Pack Manager
                wrapper.dataset.index = idx;
                wrapper.dataset.account = accId;

                const thumb = document.createElement('img');
                thumb.className = 'cf-selected-thumb';
                thumb.src = e.target.result;
                thumb.style.cursor = 'grab';

                // Remove button
                const removeBtn = document.createElement('button');
                removeBtn.className = 'cf-remove-btn';
                removeBtn.textContent = '✕';
                removeBtn.onclick = (ev) => {
                    ev.stopPropagation();
                    window.accountImages[accId].splice(idx, 1);
                    renderThumbnails(accId);
                    showToast('Image removed', 'info');
                };

                wrapper.appendChild(thumb);
                wrapper.appendChild(removeBtn);
                container.appendChild(wrapper);
            };
            reader.readAsDataURL(file);
        });

        // Re-initialise Sortable after images have been rendered
        setTimeout(() => {
            sortableInstances[accId] = new Sortable(container, {
                animation: 150,
                handle: '.cf-selected-thumb',
                ghostClass: 'cf-sortable-ghost',
                dragClass: 'cf-sortable-drag',
                onEnd: function() {
                    const newOrder = [];
                    Array.from(container.children).forEach(child => {
                        const oldIdx = parseInt(child.dataset.index, 10);
                        if (!isNaN(oldIdx) && window.accountImages[accId][oldIdx]) {
                            newOrder.push(window.accountImages[accId][oldIdx]);
                        }
                    });
                    window.accountImages[accId] = newOrder;
                    // Update dataset indices
                    Array.from(container.children).forEach((child, i) => {
                        child.dataset.index = i;
                    });
                    showToast('Order updated', 'info');
                }
            });
        }, 50);
    }

    // ========== File input & dropzone ==========
    function triggerInput(accId) {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'image/*';
        input.onchange = (e) => {
            const fileList = e.target.files;
            if (fileList.length) {
                const imgFiles = Array.from(fileList).filter(f => f.type.startsWith('image/'));
                window.accountImages[accId].push(...imgFiles);
                renderThumbnails(accId);
                showToast(`+${imgFiles.length} image(s) added`, 'success');
            }
        };
        input.click();
    }

    function setupDropzones() {
        [1, 2, 3].forEach(accId => {
            const dz = document.getElementById(`dz-${accId}`);
            if (!dz) return;

            // Click to select files
            dz.addEventListener('click', () => triggerInput(accId));

            // Drag & drop
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
                    window.accountImages[accId].push(...files);
                    renderThumbnails(accId);
                    showToast(`${files.length} dropped`, 'success');
                }
            });
        });
    }

    // ========== Master-to-children mirroring ==========
    function setupMirroring() {
        const master = document.getElementById('masterPost');
        const childTextareas = [
            document.getElementById('post-1'),
            document.getElementById('post-2'),
            document.getElementById('post-3')
        ];

        master.addEventListener('input', () => {
            childTextareas.forEach(ta => {
                if (ta) {
                    ta.value = master.value;
                    updateCharCounter(ta);
                }
            });
            updateCharCounter(master);
        });

        // Also update child counters when they are edited directly
        childTextareas.forEach(ta => {
            if (ta) {
                ta.addEventListener('input', () => updateCharCounter(ta));
            }
        });
    }

    // ========== Post to Cloudflare Worker ==========
    async function sendToWorker(accId) {
        const statusEl = document.getElementById(`status-${accId}`);
        const textarea = document.getElementById(`post-${accId}`);
        if (!textarea) return;
        const text = textarea.value;
        const images = window.accountImages[accId] || [];

        statusEl.textContent = '⏳ Posting...';
        statusEl.style.color = '#aaa';

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

            if (data.success && data.data && data.data.id) {
                statusEl.textContent = '✅ Posted!';
                statusEl.style.color = '#4CAF50';
                showToast('Tweet posted successfully!', 'success');
                // Optionally clear images after successful post
                window.accountImages[accId] = [];
                renderThumbnails(accId);
            } else {
                statusEl.textContent = '❌ Error: ' + (data.error || data.detail || 'Unknown');
                statusEl.style.color = '#f44336';
                console.error('Post error:', data);
            }
        } catch (err) {
            statusEl.textContent = '❌ Connection Failed';
            statusEl.style.color = '#f44336';
        }
    }

    // Make sendToWorker globally accessible for the onclick attributes
    window.sendToWorker = sendToWorker;
    window.triggerInput = triggerInput;   // not needed if using dropzones, but keep for potential direct calls

    // ========== Initialization ==========
    function init() {
        // Install counters on all textareas
        installCharCounter(document.getElementById('masterPost'));
        installCharCounter(document.getElementById('post-1'));
        installCharCounter(document.getElementById('post-2'));
        installCharCounter(document.getElementById('post-3'));

        setupMirroring();
        setupDropzones();

        // Initial render (maybe empty)
        renderThumbnails(1);
        renderThumbnails(2);
        renderThumbnails(3);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
