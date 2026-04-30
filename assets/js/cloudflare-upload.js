// pack-manager.js – Manual Upload button (metadata only, no image upload)

(function() {
    'use strict';

    const container = document.getElementById('packmanager');
    if (!container) return;

    const WORKER_URL = 'https://packs-api.velutinx.workers.dev/api/packs';
    const STORAGE_KEY = 'packs_offline_db';

    // ---------- Temporary state for manual upload ----------
    let currentZipFile = null;          // raw ZIP File object
    let currentPackEntry = null;       // { id, title, category, price, illustrationCount, downloadUrl }
    let currentIllustrationCount = 0;

    // ---------- DOM elements ----------
    const pmDropzone = document.getElementById('pm-dropzone');
    const pmFileInput = document.getElementById('pm-fileInput');
    const pmDownloadUrl = document.getElementById('pm-downloadUrl');
    const pmStatus = document.getElementById('pm-status');
    const pmCategoryToggle = document.getElementById('pm-categoryToggle');
    const pmRefreshBtn = document.getElementById('pm-refreshTableBtn');
    const pmSyncBtn = document.getElementById('pm-syncRemoteBtn');
    const pmConnStatus = document.getElementById('pm-connStatus');
    const pmTableBody = document.getElementById('pm-tableBody');
    const pmUploadBtn = document.getElementById('pm-uploadBtn');   // NEW button

    let remoteReachable = false;
    let pendingSync = false;
    let currentPacks = [];
    let sortColumn = null;
    let sortDirection = 'asc';

    function pmShowToast(message, type = 'success') {
        if (typeof showToast === 'function') {
            showToast(`[Pack Manager] ${message}`, type);
        } else {
            console.warn('showToast not available:', message);
        }
    }

    function getLocalPacks() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        try { return JSON.parse(raw); } catch(e) { return []; }
    }
    function saveLocalPacks(packs) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(packs));
    }
    function upsertLocalPack(packEntry) {
        let packs = getLocalPacks();
        const idx = packs.findIndex(p => p.id === packEntry.id);
        if (idx !== -1) packs[idx] = { ...packEntry, updatedAt: Date.now() };
        else packs.push({ ...packEntry, updatedAt: Date.now() });
        saveLocalPacks(packs);
        return packs;
    }

    async function fetchWithTimeout(url, options, timeout = 8000) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        try {
            const response = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(id);
            return response;
        } catch (err) {
            clearTimeout(id);
            throw err;
        }
    }
    async function fetchRemotePacks() {
        const response = await fetchWithTimeout(WORKER_URL, { method: 'GET', mode: 'cors' }, 7000);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Invalid response format');
        return data;
    }
    async function postPackToRemote(packEntry) {
        const formData = new FormData();
        formData.append('id', packEntry.id);
        formData.append('title', packEntry.title);
        formData.append('category', packEntry.category);
        formData.append('price', packEntry.price);
        formData.append('illustrationCount', packEntry.illustrationCount);
        formData.append('downloadUrl', packEntry.downloadUrl || '');
        const response = await fetchWithTimeout(WORKER_URL, {
            method: 'POST',
            body: formData,
            mode: 'cors'
        }, 10000);
        if (!response.ok) {
            const errText = await response.text().catch(() => '');
            throw new Error(`Remote store failed (${response.status}): ${errText}`);
        }
        return await response.json();
    }
    async function checkRemoteHealth() {
        try {
            await fetchRemotePacks();
            remoteReachable = true;
            updateConnectionUI(true);
            return true;
        } catch (err) {
            console.warn("Pack Manager: Remote unreachable", err);
            remoteReachable = false;
            updateConnectionUI(false);
            return false;
        }
    }
    function updateConnectionUI(isOnline) {
        if (isOnline) {
            pmConnStatus.textContent = '☁️ Cloud Online';
            pmConnStatus.className = 'pm-connection-badge online';
        } else {
            pmConnStatus.textContent = '📴 Offline Mode (local storage)';
            pmConnStatus.className = 'pm-connection-badge offline';
        }
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    function sortPacks(packs, column, direction) {
        const sorted = [...packs];
        sorted.sort((a, b) => {
            let valA, valB;
            switch(column) {
                case 'id':
                    valA = parseInt(a.id, 10);
                    valB = parseInt(b.id, 10);
                    break;
                case 'illustrations':
                    valA = a.illustrationCount || 0;
                    valB = b.illustrationCount || 0;
                    break;
                case 'category':
                    valA = a.category === 1 ? 'Female' : 'Femboy';
                    valB = b.category === 1 ? 'Female' : 'Femboy';
                    break;
                case 'price':
                    valA = a.price || '';
                    valB = b.price || '';
                    break;
                case 'download':
                    valA = a.downloadUrl ? a.downloadUrl.toLowerCase() : '';
                    valB = b.downloadUrl ? b.downloadUrl.toLowerCase() : '';
                    break;
                default: // title
                    valA = a.title ? a.title.toLowerCase() : '';
                    valB = b.title ? b.title.toLowerCase() : '';
            }
            if (typeof valA === 'number' && typeof valB === 'number') {
                return direction === 'asc' ? valA - valB : valB - valA;
            }
            if (valA < valB) return direction === 'asc' ? -1 : 1;
            if (valA > valB) return direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    }

    function renderTable(packs) {
        currentPacks = packs;
        const sorted = sortPacks(packs, sortColumn, sortDirection);
        if (!sorted.length) {
            pmTableBody.innerHTML = '<tr class="pm-empty-row"><td colspan="6">📭 No packs stored yet. Upload a ZIP above.</td></tr>';
            return;
        }
        pmTableBody.innerHTML = sorted.map(pack => {
            const categoryText = pack.category === 1 ? 'Female' : 'Femboy';
            const categoryClass = pack.category === 1 ? 'pm-cat-female' : 'pm-cat-femboy';
            const downloadCell = pack.downloadUrl && pack.downloadUrl.trim()
                ? `<a href="${escapeHtml(pack.downloadUrl)}" target="_blank" class="download-link">🔗 Link</a>`
                : '—';
            return `
                <tr>
                    <td><code>${escapeHtml(pack.id)}</code></td>
                    <td>${escapeHtml(pack.title)}</td>
                    <td><span class="pm-category-badge ${categoryClass}">${categoryText}</span></td>
                    <td>${escapeHtml(pack.price)}</td>
                    <td>${pack.illustrationCount}</td>
                    <td>${downloadCell}</td>
                </tr>
            `;
        }).join('');
        document.querySelectorAll('#packmanager th span').forEach(span => span.innerHTML = '');
        if (sortColumn) {
            const iconSpan = document.getElementById(`sort-${sortColumn}-icon`);
            if (iconSpan) iconSpan.innerHTML = sortDirection === 'asc' ? ' ▲' : ' ▼';
        }
    }

    function setSort(column) {
        if (sortColumn === column) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sortColumn = column;
            sortDirection = 'asc';
        }
        renderTable(currentPacks);
    }

    function bindSortHandlers() {
        const headers = ['id', 'title', 'category', 'price', 'illustrations', 'download'];
        headers.forEach(col => {
            const th = document.getElementById(`sort-${col}`);
            if (th) {
                th.onclick = () => setSort(col);
            }
        });
    }

    async function loadAllPacks() {
        pmTableBody.innerHTML = '<tr class="pm-empty-row"><td colspan="6"><span class="pm-loading"></span> Loading packs...</td></tr>';
        try {
            const remotePacks = await fetchRemotePacks();
            remoteReachable = true;
            updateConnectionUI(true);
            saveLocalPacks(remotePacks);
            currentPacks = remotePacks;
            renderTable(currentPacks);
            pmShowToast(`✅ Loaded ${remotePacks.length} packs from cloud`, 'success');
            removeOfflineWarning();
        } catch (err) {
            console.error("Pack Manager remote fetch failed:", err);
            remoteReachable = false;
            updateConnectionUI(false);
            const localPacks = getLocalPacks();
            if (localPacks.length) {
                currentPacks = localPacks;
                renderTable(currentPacks);
                pmShowToast(`⚠️ Cloud unreachable — using local backup (${localPacks.length} packs)`, 'error');
                addOfflineWarning();
            } else {
                currentPacks = [];
                renderTable([]);
                pmShowToast(`⚠️ No connection & no local data. Upload a ZIP to start.`, 'error');
                addOfflineWarning();
            }
        }
    }

    function addOfflineWarning() {
        if (document.querySelector('#pm-warning-banner')) return;
        const tableSection = document.querySelector('#packmanager .pm-table-section');
        const warnDiv = document.createElement('div');
        warnDiv.id = 'pm-warning-banner';
        warnDiv.className = 'pm-warning-banner';
        warnDiv.innerHTML = `
            <span>⚠️ <strong>Offline mode active</strong> — Changes are saved locally. Click "Sync to Cloud" when connection restores.</span>
            <button class="pm-small-retry" id="pm-retryConnectionBtn">⟳ Retry Connection</button>
        `;
        tableSection.insertBefore(warnDiv, tableSection.firstChild);
        document.getElementById('pm-retryConnectionBtn')?.addEventListener('click', async () => {
            pmShowToast("Checking connection...", "info");
            const ok = await checkRemoteHealth();
            if (ok) {
                pmShowToast("✅ Cloud reachable! Syncing local data...", "success");
                await syncAllLocalToRemote();
                await loadAllPacks();
                document.getElementById('pm-warning-banner')?.remove();
            } else {
                pmShowToast("❌ Still offline. Try again later.", "error");
            }
        });
    }
    function removeOfflineWarning() {
        document.getElementById('pm-warning-banner')?.remove();
    }

    async function syncAllLocalToRemote() {
        const localPacks = getLocalPacks();
        if (localPacks.length === 0) {
            pmShowToast("Nothing to sync", "success");
            return true;
        }
        if (!remoteReachable) {
            const isOnline = await checkRemoteHealth();
            if (!isOnline) {
                pmShowToast("Cannot sync: cloud unreachable. Retry later.", "error");
                return false;
            }
        }
        pendingSync = true;
        let successCount = 0, failCount = 0;
        for (const pack of localPacks) {
            try {
                await postPackToRemote(pack);
                successCount++;
            } catch (err) {
                console.error(`Sync failed for ${pack.id}:`, err);
                failCount++;
            }
        }
        pendingSync = false;
        if (failCount === 0) {
            pmShowToast(`✅ Synced ${successCount} packs to cloud`, 'success');
            await loadAllPacks();
            removeOfflineWarning();
            remoteReachable = true;
            updateConnectionUI(true);
        } else {
            pmShowToast(`⚠️ Synced ${successCount} packs, ${failCount} failed. Retry later.`, 'error');
        }
        return failCount === 0;
    }

    function cleanFilename(rawName) {
        let name = rawName.replace(/\.zip$/i, '');
        name = name.replace(/\s*\(\d+\)\s*$/, '');
        return name.trim();
    }
    function parseFilename(filename) {
        const base = cleanFilename(filename);
        const regex = /^\[Pack (\d+)\]\s+(.+?)\s*-\s*(.+)$/i;
        const match = base.match(regex);
        if (!match) return null;
        return { pack: match[1], character: match[2].trim(), series: match[3].trim().toUpperCase() };
    }
    async function storePackWithFallback(packEntry) {
        if (remoteReachable) {
            try {
                const result = await postPackToRemote(packEntry);
                upsertLocalPack(packEntry);
                pmShowToast(`☁️ Pack #${packEntry.id} saved to cloud`, 'success');
                return { success: true, source: 'remote', result };
            } catch (err) {
                console.warn("Remote store failed, switching to local fallback:", err);
                remoteReachable = false;
                updateConnectionUI(false);
                addOfflineWarning();
            }
        }
        upsertLocalPack(packEntry);
        pmShowToast(`💾 Pack #${packEntry.id} saved to LOCAL storage (cloud offline)`, 'success');
        return { success: true, source: 'local' };
    }

    // ================== UPLOAD BUTTON ACTION (metadata only) ==================
    async function uploadPackMetadata() {
        if (!currentPackEntry) {
            pmShowToast('No ZIP processed yet – drop a file first', 'error');
            return;
        }

        // Read the current toggle and download link
        currentPackEntry.category = pmCategoryToggle.checked ? 1 : 2;
        currentPackEntry.downloadUrl = pmDownloadUrl.value.trim() || null;

        pmStatus.textContent = `⏳ Saving pack #${currentPackEntry.id} ...`;
        pmUploadBtn.disabled = true;
        pmUploadBtn.textContent = '⏳ Saving...';

        try {
            await storePackWithFallback(currentPackEntry);
            pmStatus.textContent = `✅ Pack #${currentPackEntry.id} stored | ${currentIllustrationCount} images | ${currentPackEntry.price}`;
            await loadAllPacks();

            // Clear temporary state after successful save
            currentZipFile = null;
            currentPackEntry = null;
            currentIllustrationCount = 0;
            pmUploadBtn.disabled = true;
        } catch (err) {
            console.error(err);
            pmStatus.textContent = '❌ Failed to save pack.';
            pmShowToast(`Error: ${err.message}`, 'error');
        } finally {
            pmUploadBtn.disabled = false;
            pmUploadBtn.textContent = '📤 Upload to Cloudflare';
        }
    }

    // ================== MODIFIED processZip: only store temporary data ==================
    async function processZip(file) {
        pmStatus.textContent = '📂 Reading ZIP...';
        try {
            const zip = await JSZip.loadAsync(file);
            const imageEntries = [];
            zip.forEach((path, entry) => {
                if (!entry.dir && /\.(jpg|jpeg|png|gif|webp)$/i.test(path)) imageEntries.push(entry);
            });
            if (imageEntries.length === 0) {
                pmStatus.textContent = '❌ No images found in ZIP.';
                pmShowToast('No images found', 'error');
                return;
            }
            const parsed = parseFilename(file.name);
            if (!parsed) {
                pmStatus.textContent = '❌ Filename does not match [Pack XXX] ... format.';
                pmShowToast('Invalid filename format: expected [Pack 001] Name - Series', 'error');
                return;
            }
            const packNumber = parsed.pack;
            const illustrationCount = imageEntries.length;
            const price = illustrationCount <= 45 ? "PRICE_1" : "PRICE_2";
            const isFemale = pmCategoryToggle.checked;
            const category = isFemale ? 1 : 2;
            const title = cleanFilename(file.name);
            const id = String(packNumber).padStart(3, '0');
            const downloadUrl = pmDownloadUrl.value.trim() || null;

            // Store temporarily – no saving yet
            currentZipFile = file;
            currentPackEntry = { id, title, category, price, illustrationCount, downloadUrl };
            currentIllustrationCount = illustrationCount;

            pmStatus.textContent = `📦 Ready: Pack #${id} | ${illustrationCount} images | ${price}`;
            pmUploadBtn.disabled = false;   // enable the Upload button
            pmShowToast(`✅ ZIP analysed. Set the category & download link, then click "Upload".`, 'info');

        } catch (err) {
            console.error(err);
            pmStatus.textContent = '❌ Failed to process pack.';
            pmShowToast(`Error: ${err.message}`, 'error');
            currentZipFile = null;
            currentPackEntry = null;
            currentIllustrationCount = 0;
            pmUploadBtn.disabled = true;
        }
    }

    // ================== EVENT LISTENERS ==================
    if (pmDropzone) {
        pmDropzone.addEventListener('click', () => pmFileInput.click());
        pmDropzone.addEventListener('dragover', (e) => { e.preventDefault(); pmDropzone.style.borderColor = '#5a6e3c'; });
        pmDropzone.addEventListener('dragleave', () => { pmDropzone.style.borderColor = '#3a4050'; });
        pmDropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            pmDropzone.style.borderColor = '#3a4050';
            const file = e.dataTransfer.files[0];
            if (file && file.name.toLowerCase().endsWith('.zip')) {
                processZip(file);
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                pmFileInput.files = dataTransfer.files;
            } else {
                pmShowToast('Please drop a .zip file', 'error');
            }
        });
    }
    if (pmFileInput) {
        pmFileInput.addEventListener('change', (e) => {
            if (e.target.files.length) processZip(e.target.files[0]);
        });
    }

    // Category toggle only updates the temporary entry
    if (pmCategoryToggle) {
        pmCategoryToggle.addEventListener('change', () => {
            if (currentPackEntry) {
                currentPackEntry.category = pmCategoryToggle.checked ? 1 : 2;
                const catText = currentPackEntry.category === 1 ? 'Female' : 'Femboy';
                pmStatus.textContent = `📦 Ready: Pack #${currentPackEntry.id} | ${currentIllustrationCount} images | Category: ${catText}`;
                pmShowToast(`Category updated to ${catText}`, 'info');
            }
        });
    }

    if (pmRefreshBtn) pmRefreshBtn.addEventListener('click', () => loadAllPacks());
    if (pmSyncBtn) {
        pmSyncBtn.addEventListener('click', async () => {
            if (pendingSync) {
                pmShowToast("Sync already in progress...", "error");
                return;
            }
            pmSyncBtn.textContent = "⏳ Syncing...";
            await syncAllLocalToRemote();
            pmSyncBtn.textContent = "🔄 Sync to Cloud";
        });
    }

    // Upload button (metadata only)
    if (pmUploadBtn) {
        pmUploadBtn.addEventListener('click', uploadPackMetadata);
        pmUploadBtn.disabled = true;  // disabled until a ZIP is loaded
    }

    bindSortHandlers();

    // Initialise
    (async function init() {
        await checkRemoteHealth();
        await loadAllPacks();
        if (!remoteReachable) addOfflineWarning();
    })();
})();
