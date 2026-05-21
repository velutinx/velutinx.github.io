// velutinx.github.io/assets/js/twitter-composer.js

(function() {
    'use strict';

    function showToast(msg, type = 'success') {
        let c = document.getElementById('toast-container');
        if (!c) {
            c = document.createElement('div');
            c.id = 'toast-container';
            c.style.cssText = 'position:fixed; top:20px; right:20px; z-index:9999;';
            document.body.appendChild(c);
        }
        const t = document.createElement('div');
        t.className = `toast-notification ${type}`;
        t.textContent = msg;
        c.appendChild(t);
        setTimeout(() => t.remove(), 3000);
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
        if (!counter) {
            counter = document.createElement('div');
            counter.className = 'word-counter';
            parent.insertBefore(counter, textarea.nextSibling);
        }
        textarea._wc = counter;
        textarea.addEventListener('input', () => updateTwitterCounter(textarea));
        updateTwitterCounter(textarea);
    }

    // ---------- Helper: strip URLs from a string ----------
    function stripUrls(text) {
        // Replace any http/https URL with the link-in-bio message
        return text.replace(/https?:\/\/\S+/g, 'Full set on Patreon (link in bio)');
    }

    // ---------- Master mirroring (URLs kept for Bluesky, stripped for Twitter) ----------
    const master = document.getElementById('masterPost');
    const allChildren = [
        document.getElementById('post1'), document.getElementById('post2'),
        document.getElementById('twitter-post-1'), document.getElementById('twitter-post-2'),
        document.getElementById('twitter-post-3')
    ].filter(Boolean);
    if (master) {
        master.addEventListener('input', () => {
            const rawText = master.value;
            const twitterText = stripUrls(rawText);   // URLs replaced for Twitter
            allChildren.forEach(ta => {
                // Bluesky boxes (post1, post2) keep the original text with URLs;
                // Twitter boxes (twitter-post-*) get the stripped version
                const isTwitter = ta.id && ta.id.startsWith('twitter-');
                ta.value = isTwitter ? twitterText : rawText;
            });
            allChildren.forEach(ta => ta.dispatchEvent(new Event('input')));
        });
    }

    // Twitter image ID arrays (separate from Bluesky)
    window.twitterImageIds = window.twitterImageIds || { 1: [], 2: [], 3: [] };

    // ---------- Lock / Unlock for Twitter accounts 1 & 2 ----------
    function getTw12Buttons() {
        return [
            document.querySelector('button[onclick="sendToWorker(1)"]'),
            document.querySelector('button[onclick="sendToWorker(2)"]')
        ].filter(Boolean);
    }
    function disableTw12Buttons() {
        getTw12Buttons().forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
            btn.title = 'Already posted – add new content to re‑enable';
        });
    }
    function enableTw12Buttons() {
        getTw12Buttons().forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
            btn.title = '';
        });
    }
    function clearTwitter12() {
        ['twitter-post-1', 'twitter-post-2'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.value = '';
                el.dispatchEvent(new Event('input'));
            }
        });
        window.twitterImageIds[1] = [];
        window.twitterImageIds[2] = [];
        if (typeof window.renderTwitterThumbnails === 'function') {
            window.renderTwitterThumbnails(1);
            window.renderTwitterThumbnails(2);
        }
    }
    function lockTwitter12() {
        clearTwitter12();
        disableTw12Buttons();
    }
    function unlockTwitter12IfNeeded() {
        const tw1Text = (document.getElementById('twitter-post-1')?.value || '').trim();
        const tw2Text = (document.getElementById('twitter-post-2')?.value || '').trim();
        const bs2Text = (document.getElementById('post2')?.value || '').trim();
        const tw1Images = window.twitterImageIds[1]?.length || 0;
        const tw2Images = window.twitterImageIds[2]?.length || 0;
        const bs2Images = window.accountImages?.[2]?.length || 0;
        if (tw1Text || tw2Text || bs2Text || tw1Images || tw2Images || bs2Images) {
            enableTw12Buttons();
        }
    }
    window.unlockTwitter12IfNeeded = unlockTwitter12IfNeeded;

    // ---------- SFW Twitter lock (account 3) ----------
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
    function unlockSfwTwitterIfNeeded() {
        const twText = (document.getElementById('twitter-post-3')?.value || '').trim();
        const bsText = (document.getElementById('post1')?.value || '').trim();
        const bsImages = window.accountImages?.[1]?.length || 0;
        if (twText || bsText || bsImages) {
            enableSfwTwitterBtn();
        }
    }
    window.unlockSfwTwitterIfNeeded = unlockSfwTwitterIfNeeded;

    // ---------- Render Twitter thumbnails ----------
    const twitterSortables = {};
    const renderTimers = { 1: null, 2: null, 3: null };

    function renderTwitterThumbnails(twAccId) {
        const container = document.getElementById(`tw-container-${twAccId}`);
        if (!container) return;
        if (renderTimers[twAccId]) {
            clearTimeout(renderTimers[twAccId]);
            renderTimers[twAccId] = null;
        }
        renderTimers[twAccId] = setTimeout(() => {
            renderTimers[twAccId] = null;
            container.style.display = 'flex';
            container.style.flexWrap = 'wrap';
            container.style.gap = '8px';
            if (twitterSortables[twAccId]) {
                twitterSortables[twAccId].destroy();
                twitterSortables[twAccId] = null;
            }

            let sourceIds;
            if (twAccId == 3) {
                sourceIds = window.accountImages?.[1] || [];
            } else {
                sourceIds = window.twitterImageIds[twAccId] || [];
            }

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
                    if (rid) {
                        const arr = (twAccId == 3) ? (window.accountImages?.[1] || []) : window.twitterImageIds[twAccId];
                        const pos = arr.indexOf(rid);
                        if (pos !== -1) arr.splice(pos, 1);
                        if (twAccId == 3 && window.accountImages?.[1]) {
                            const bsPos = window.accountImages[1].indexOf(rid);
                            if (bsPos !== -1) window.accountImages[1].splice(bsPos, 1);
                        } else if (twAccId == 1 || twAccId == 2) {
                            const bsPos = window.accountImages?.[2]?.indexOf(rid) ?? -1;
                            if (bsPos !== -1) window.accountImages[2].splice(bsPos, 1);
                        }
                        let inUse = false;
                        for (const arr of [window.accountImages?.[1], window.accountImages?.[2],
                                              window.twitterImageIds[1], window.twitterImageIds[2], window.twitterImageIds[3]]) {
                            if (arr && arr.includes(rid)) { inUse = true; break; }
                        }
                        if (!inUse) delete window.imageRegistry?.[rid];
                    }
                    if (twAccId == 3 && typeof window.renderBlueskyThumbnails === 'function') {
                        window.renderBlueskyThumbnails(1);
                    } else if ((twAccId == 1 || twAccId == 2) && typeof window.renderBlueskyThumbnails === 'function') {
                        window.renderBlueskyThumbnails(2);
                    }
                    renderTwitterThumbnails(twAccId);
                    if (twAccId == 1 || twAccId == 2) unlockTwitter12IfNeeded();
                    else if (twAccId == 3) unlockSfwTwitterIfNeeded();
                    showToast('Image removed', 'info');
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
                        const newOrder = [];
                        Array.from(container.children).forEach(child => {
                            const id = child.dataset.id;
                            if (id && window.imageRegistry?.[id]) newOrder.push(id);
                        });
                        if (twAccId == 3) {
                            window.accountImages[1] = newOrder;
                            window.twitterImageIds[3] = [...newOrder];
                        } else {
                            window.twitterImageIds[twAccId] = newOrder;
                            if (twAccId == 1 || twAccId == 2) {
                                window.accountImages[2] = [...newOrder];
                                window.twitterImageIds[1] = [...newOrder];
                                window.twitterImageIds[2] = [...newOrder];
                            }
                        }
                        Array.from(container.children).forEach((child, i) => { child.dataset.index = i; });
                        if (twAccId == 3 && typeof window.renderBlueskyThumbnails === 'function') {
                            window.renderBlueskyThumbnails(1);
                        } else if ((twAccId == 1 || twAccId == 2) && typeof window.renderBlueskyThumbnails === 'function') {
                            window.renderBlueskyThumbnails(2);
                        }
                        if (twAccId == 1) renderTwitterThumbnails(2);
                        else if (twAccId == 2) renderTwitterThumbnails(1);
                        if (twAccId == 1 || twAccId == 2) unlockTwitter12IfNeeded();
                        else if (twAccId == 3) unlockSfwTwitterIfNeeded();
                        showToast('Order updated', 'info');
                    }
                });
            }, 60);
        }, 20);
    }

    // ---------- Posting to Twitter ----------
    async function sendToWorker(accId) {
        const statusEl = document.getElementById(`tw-status-${accId}`);
        const textarea = document.getElementById(`twitter-post-${accId}`);
        if (!textarea) return;
        const text = textarea.value;
        const sourceIds = (accId == 3) ? (window.accountImages?.[1] || []) : (window.twitterImageIds[accId] || []);
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
                statusEl.textContent = '✅ Posted!';
                statusEl.style.color = '#4CAF50';
                showToast(data.retweetSuccess ? 'Tweet posted & retweeted!' : 'Tweet posted!', 'success');

                if (accId == 1 || accId == 2) {
                    lockTwitter12();
                } else if (accId == 3) {
                    const tw3Text = document.getElementById('twitter-post-3');
                    if (tw3Text) {
                        tw3Text.value = '';
                        tw3Text.dispatchEvent(new Event('input'));
                    }
                    window.twitterImageIds[3] = [];
                    window.accountImages[1] = [];
                    if (typeof window.renderBlueskyThumbnails === 'function') window.renderBlueskyThumbnails(1);
                    renderTwitterThumbnails(3);
                }
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
        if (!window.imageRegistry) window.imageRegistry = {};
        if (!window.accountImages) window.accountImages = { 1: [], 2: [] };
        if (!window.twitterImageIds) window.twitterImageIds = { 1: [], 2: [], 3: [] };

        ['post2', 'twitter-post-1', 'twitter-post-2'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', unlockTwitter12IfNeeded);
        });
        ['post1', 'twitter-post-3'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', unlockSfwTwitterIfNeeded);
        });

        renderTwitterThumbnails(1);
        renderTwitterThumbnails(2);
        renderTwitterThumbnails(3);
        window.renderTwitterThumbnails = renderTwitterThumbnails;

        unlockTwitter12IfNeeded();
        unlockSfwTwitterIfNeeded();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
