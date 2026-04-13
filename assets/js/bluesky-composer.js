// This is velutinx.github.io/assets/js/bluesky-composer.js

(function() {
    // 1. Tab Logic: Shared across the dashboard
    const initTabs = () => {
        const tabBtns = document.querySelectorAll('.tab-button');
        const tabs = document.querySelectorAll('.tab-content');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.tab;
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                tabs.forEach(t => t.classList.remove('active'));
                const target = document.getElementById(id);
                if (target) target.classList.add('active');
            });
        });
    };

    // 2. Master Input Logic: Cleaning & Formatting
    const master = document.getElementById('masterPost');
    const posts = [document.getElementById('post1'), document.getElementById('post2')];

    function transformMaster() {
        let content = master.value;
        if (!content.trim()) {
            posts.forEach(p => p ? p.value = '' : null);
            return;
        }

        let lines = content.split(/\r?\n/);
        // Filters out disclaimer text in both languages
        lines = lines.filter(line => {
            const lower = line.toLowerCase();
            return !lower.includes('免責事項') && !lower.includes('disclaimer:');
        });

        while (lines.length && lines[lines.length-1].trim() === '') lines.pop();
        if (lines.length === 0) return;

        let lastLine = lines.pop() || '';
        const hashtags = typeof textToHashtags === 'function' ? textToHashtags(lastLine) : lastLine;
        
        let finalText = lines.join('\n');
        if (finalText && !finalText.endsWith('\n')) finalText += '\n';
        finalText += hashtags;

        posts.forEach(p => { if (p) p.value = finalText; });
    }

    // 3. Image Management State
    window.accountImages = { 1: [], 2: [] };

    function renderThumbnails(acc) {
        const container = document.querySelector(`.thumbnail-container[data-account="${acc}"]`);
        if (!container) return;
        
        const files = window.accountImages[acc];
        container.innerHTML = '';

        files.forEach((file, idx) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const div = document.createElement('div');
                div.className = 'thumbnail-item';
                div.draggable = true;
                div.dataset.index = idx;
                div.dataset.account = acc;
                
                div.innerHTML = `
                    <img src="${e.target.result}">
                    <button class="remove-btn" title="Remove">✕</button>
                `;

                div.querySelector('.remove-btn').onclick = (ev) => {
                    ev.stopPropagation();
                    window.accountImages[acc].splice(idx, 1);
                    renderThumbnails(acc);
                    if (typeof showToast === 'function') showToast('Image removed', 'info');
                };

                // Drag & Drop Listeners
                div.addEventListener('dragstart', handleDragStart);
                div.addEventListener('dragover', (e) => e.preventDefault());
                div.addEventListener('drop', handleDrop);
                div.addEventListener('dragend', () => div.classList.remove('dragging'));
                
                container.appendChild(div);
            };
            reader.readAsDataURL(file);
        });
    }

    // 4. Drag & Drop Logic
    let dragSource = null;
    function handleDragStart(e) {
        dragSource = e.target.closest('.thumbnail-item');
        if(!dragSource) return;
        e.dataTransfer.effectAllowed = 'move';
        dragSource.classList.add('dragging');
    }

    function handleDrop(e) {
        e.preventDefault();
        const target = e.target.closest('.thumbnail-item');
        if(!target || !dragSource || target === dragSource) return;

        const srcAcc = dragSource.dataset.account;
        const tgtAcc = target.dataset.account;
        if(srcAcc !== tgtAcc) return;

        const files = window.accountImages[srcAcc];
        const srcIdx = parseInt(dragSource.dataset.index);
        const tgtIdx = parseInt(target.dataset.index);
        
        const [moved] = files.splice(srcIdx, 1);
        files.splice(tgtIdx, 0, moved);
        
        renderThumbnails(srcAcc);
    }

    // 5. API Interaction
    async function postToBluesky(accountId) {
        const postEl = document.getElementById(`post${accountId}`);
        const text = postEl ? postEl.value.trim() : '';
        const images = window.accountImages[accountId] || [];

        if(!text && images.length === 0) {
            if (typeof showToast === 'function') showToast('Add text or image first', 'error');
            return;
        }

        let statusDiv = document.getElementById(`post-status-${accountId}`);
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.id = `post-status-${accountId}`;
            statusDiv.className = 'post-status-label';
            postEl.parentNode.appendChild(statusDiv);
        }

        statusDiv.textContent = '⏳ Posting...';
        statusDiv.style.color = '#aaa';

        try {
            const fd = new FormData();
            fd.append('account', accountId);
            fd.append('text', text);
            images.forEach(img => fd.append('image', img));

            const res = await fetch('https://bluesky-post-proxy-final.velutinx.workers.dev', { 
                method: 'POST', 
                body: fd 
            });

            const data = await res.json();

            if(res.ok) {
                statusDiv.textContent = '✅ Posted!';
                statusDiv.style.color = '#4caf50';
                window.accountImages[accountId] = [];
                renderThumbnails(accountId);
                setTimeout(() => statusDiv.textContent = '', 3000);
            } else {
                throw new Error(data.error || 'Server error');
            }
        } catch(err) {
            statusDiv.textContent = `❌ ${err.message}`;
            statusDiv.style.color = '#ff5252';
        }
    }

    // 6. Initialization
    const init = () => {
        initTabs();
        if (master) master.addEventListener('input', transformMaster);

        // Setup Dropzones
        document.querySelectorAll('.dropzone').forEach(dz => {
            const acc = dz.dataset.account;
            dz.addEventListener('click', () => {
                const inp = document.createElement('input');
                inp.type = 'file';
                inp.multiple = true;
                inp.accept = 'image/*';
                inp.onchange = () => {
                    if(inp.files.length) {
                        window.accountImages[acc].push(...Array.from(inp.files));
                        renderThumbnails(acc);
                    }
                };
                inp.click();
            });
            // ... (Dragover/Drop listeners remain as you had them)
        });

        // Inject Buttons into Cards
        document.querySelectorAll('.account-card').forEach(card => {
            const acc = card.dataset.account;
            const btn = document.createElement('button');
            btn.className = 'bsky-post-btn';
            btn.textContent = '🚀 Post to Bluesky';
            btn.onclick = () => postToBluesky(acc);
            card.appendChild(btn);
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
