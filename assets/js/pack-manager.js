// pack-manager.js – Manual Upload (metadata + selected images to R2)

(function() {
    'use strict';

    const container = document.getElementById('packmanager');
    if (!container) return;

    const WORKER_URL        = 'https://packs-api.velutinx.workers.dev/api/packs';
    const UPLOAD_WORKER_URL = 'https://i2-uploader.velutinx.workers.dev';
    const STORAGE_KEY       = 'packs_offline_db';

    // Temp state
    let currentZipFile          = null;
    let currentPackEntry        = null;
    let currentIllustrationCount = 0;

    // DOM elements
    const pmDropzone       = document.getElementById('pm-dropzone');
    const pmFileInput      = document.getElementById('pm-fileInput');
    const pmDownloadUrl    = document.getElementById('pm-downloadUrl');
    const pmStatus         = document.getElementById('pm-status');
    const pmCategoryToggle = document.getElementById('pm-categoryToggle');
    const pmRefreshBtn     = document.getElementById('pm-refreshTableBtn');
    const pmSyncBtn        = document.getElementById('pm-syncRemoteBtn');
    const pmConnStatus     = document.getElementById('pm-connStatus');
    const pmTableBody      = document.getElementById('pm-tableBody');
    const pmUploadBtn      = document.getElementById('pm-uploadBtn');
    const pmImageSection   = document.getElementById('pm-image-section');
    const pmOriginalGrid   = document.getElementById('pm-originalGrid');
    const pmSelectedGrid   = document.getElementById('pm-selectedGrid');

    // Global remote state (unchanged)
    let remoteReachable = false;
    let pendingSync     = false;
    let currentPacks    = [];
    let sortColumn      = null;
    let sortDirection   = 'asc';

    // ---------- Image selection state (from Cloudflare tab) ----------
    let allImages       = [];
    let selectedIndices = new Set();
    let selectedOrder   = [];
    let packNumber      = null;   // derived from ZIP filename
    let sortable        = null;

    // ---------- Toast (unchanged) ----------
    function pmShowToast(message, type = 'success') {
        if (typeof showToast === 'function') showToast(`[Pack Manager] ${message}`, type);
        else console.warn('showToast not available:', message);
    }

    // ---------- Local Storage (unchanged) ----------
    function getLocalPacks() { /* ... keep original ... */ }
    function saveLocalPacks(packs) { /* ... */ }
    function upsertLocalPack(packEntry) { /* ... */ }

    // ---------- Remote API (unchanged) ----------
    async function fetchWithTimeout(url, options, timeout = 8000) { /* ... */ }
    async function fetchRemotePacks() { /* ... */ }
    async function postPackToRemote(packEntry) { /* ... */ }
    async function checkRemoteHealth() { /* ... */ }
    function updateConnectionUI(isOnline) { /* ... */ }

    // ---------- Table (unchanged) ----------
    function escapeHtml(str) { /* ... */ }
    function sortPacks(packs, column, direction) { /* ... */ }
    function renderTable(packs) { /* ... */ }
    function setSort(column) { /* ... */ }
    function bindSortHandlers() { /* ... */ }

    // ---------- Load / Sync (unchanged) ----------
    async function loadAllPacks() { /* ... */ }
    function addOfflineWarning() { /* ... */ }
    function removeOfflineWarning() { /* ... */ }
    async function syncAllLocalToRemote() { /* ... */ }

    // ---------- Filename parsing (unchanged) ----------
    function cleanFilename(rawName) { /* ... */ }
    function parseFilename(filename) { /* ... */ }
    async function storePackWithFallback(packEntry) { /* ... */ }

    // ========== IMAGE GRID HELPERS ==========
    function revokeAllImageURLs() {
        allImages.forEach(img => { if (img.url) URL.revokeObjectURL(img.url); });
    }

    function renderOriginalGrid() {
        if (!pmOriginalGrid) return;
        pmOriginalGrid.innerHTML = '';
        const toShow = allImages.slice(0, 30);
        toShow.forEach((img, idx) => {
            const isSelected = selectedIndices.has(idx);
            const thumb = document.createElement('img');
            thumb.className = 'cf-thumbnail';
            thumb.src = img.url;
            thumb.title = img.originalName;
            thumb.style.border = isSelected ? '3px solid #2c6e2c' : '2px solid transparent';
            thumb.onclick = () => toggleImageSelection(idx);
            pmOriginalGrid.appendChild(thumb);
        });
    }

    function renderSelectedGrid() {
        if (!pmSelectedGrid) return;
        pmSelectedGrid.innerHTML = '';
        for (let idx of selectedOrder) {
            const img = allImages[idx];
            if (!img) continue;
            const wrapper = document.createElement('div');
            wrapper.className = 'cf-selected-item';
            wrapper.dataset.index = idx;
            const thumb = document.createElement('img');
            thumb.className = 'cf-selected-thumb';
            thumb.src = img.url;
            thumb.title = img.originalName;
            const removeBtn = document.createElement('button');
            removeBtn.className = 'cf-remove-btn';
            removeBtn.textContent = '✕';
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                removeImageSelection(idx);
            };
            wrapper.appendChild(thumb);
            wrapper.appendChild(removeBtn);
            pmSelectedGrid.appendChild(wrapper);
        }
        // Enable drag reorder
        if (sortable) sortable.destroy();
        if (typeof Sortable !== 'undefined') {
            sortable = new Sortable(pmSelectedGrid, {
                animation: 150,
                onEnd: () => {
                    const newOrder = [];
                    Array.from(pmSelectedGrid.children).forEach(child => {
                        const idx = parseInt(child.dataset.index, 10);
                        if (!isNaN(idx)) newOrder.push(idx);
                    });
                    selectedOrder = newOrder;
                }
            });
        }
    }

    function toggleImageSelection(idx) {
        if (selectedIndices.has(idx)) {
            selectedIndices.delete(idx);
            const pos = selectedOrder.indexOf(idx);
            if (pos !== -1) selectedOrder.splice(pos, 1);
        } else {
            selectedIndices.add(idx);
            selectedOrder.push(idx);
        }
        renderOriginalGrid();
        renderSelectedGrid();
    }

    function removeImageSelection(idx) {
        if (selectedIndices.has(idx)) {
            selectedIndices.delete(idx);
            const pos = selectedOrder.indexOf(idx);
            if (pos !== -1) selectedOrder.splice(pos, 1);
            renderOriginalGrid();
            renderSelectedGrid();
        }
    }

    // ========== UPLOAD ACTION (metadata + images) ==========
    async function uploadPackMetadataAndImages() {
        if (!currentPackEntry) {
            pmShowToast('No ZIP processed yet – drop a file first', 'error');
            return;
        }

        // Gather metadata from UI
        currentPackEntry.category    = pmCategoryToggle.checked ? 1 : 2;
        currentPackEntry.downloadUrl = pmDownloadUrl.value.trim() || null;

        // If no images selected, we can still save metadata only
        if (selectedOrder.length === 0) {
            pmShowToast('No images selected – saving metadata only.', 'info');
        }

        pmStatus.textContent = '⏳ Uploading...';
        pmUploadBtn.disabled = true;
        pmUploadBtn.textContent = '⏳ Uploading...';

        // 1) Save pack metadata
        try {
            await storePackWithFallback(currentPackEntry);
            pmStatus.textContent = `✅ Pack #${currentPackEntry.id} stored | ${currentIllustrationCount} images`;
        } catch (err) {
            pmStatus.textContent = '❌ Metadata save failed.';
            pmShowToast(`Error: ${err.message}`, 'error');
            pmUploadBtn.disabled = false;
            pmUploadBtn.textContent = '📤 Upload to Cloudflare';
            return;
        }

        // 2) If images selected, upload them to R2 and download locally
        if (selectedOrder.length > 0) {
            const downloadPromise = downloadSelectedLocally();
            const uploadPromise   = uploadSelectedToR2();
            await Promise.allSettled([downloadPromise, uploadPromise]);
        }

        // 3) Refresh table and reset
        await loadAllPacks();
        pmUploadBtn.disabled = false;
        pmUploadBtn.textContent = '📤 Upload to Cloudflare';

        // Clear image state after successful upload
        currentZipFile = null;
        currentPackEntry = null;
        currentIllustrationCount = 0;
        allImages = [];
        selectedIndices.clear();
        selectedOrder = [];
        packNumber = null;
        revokeAllImageURLs();
        renderOriginalGrid();
        renderSelectedGrid();
        if (pmImageSection) pmImageSection.style.display = 'none';
    }

    // ---------- Image upload to R2 ----------
    async function uploadSelectedToR2() {
        if (!packNumber || selectedOrder.length === 0) return false;
        const formData = new FormData();
        formData.append('packNumber', packNumber);
        for (let i = 0; i < selectedOrder.length; i++) {
            const idx = selectedOrder[i];
            const img = allImages[idx];
            if (img) {
                const file = new File([img.blob], img.originalName, { type: img.blob.type });
                formData.append('images', file);
            }
        }
        pmShowToast('📡 Uploading images to Cloudflare...', 'info');
        try {
            const res = await fetch(UPLOAD_WORKER_URL, { method: 'POST', body: formData });
            const data = await res.json();
            if (res.ok) {
                pmShowToast(`✅ Uploaded ${data.urls.length} images to /i/`, 'success');
                return true;
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (err) {
            console.error('Upload error:', err);
            pmShowToast(`❌ Upload failed: ${err.message}`, 'error');
            return false;
        }
    }

    // ---------- Local download of selected images ----------
    async function downloadSelectedLocally() {
        if (!packNumber || selectedOrder.length === 0) return false;
        let successCount = 0;
        for (let i = 0; i < selectedOrder.length; i++) {
            const idx = selectedOrder[i];
            const img = allImages[idx];
            if (!img) continue;
            const ext = img.originalName.split('.').pop().toLowerCase();
            const newName = `pack${packNumber}-${i+1}.${ext}`;
            const a = document.createElement('a');
            a.href = img.url;
            a.download = newName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            successCount++;
            await new Promise(r => setTimeout(r, 100));
        }
        pmShowToast(`📥 Downloaded ${successCount} file(s)`, 'success');
        return true;
    }

    // ========== PROCESS ZIP (metadata + image previews) ==========
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

            // Metadata
            const illustrationCount = imageEntries.length;
            const price = illustrationCount <= 45 ? "PRICE_1" : "PRICE_2";
            const isFemale = pmCategoryToggle.checked;
            const category = isFemale ? 1 : 2;
            const title = cleanFilename(file.name);
            const id = String(parsed.pack).padStart(3, '0');
            const downloadUrl = pmDownloadUrl.value.trim() || null;

            currentZipFile = file;
            currentPackEntry = { id, title, category, price, illustrationCount, downloadUrl };
            currentIllustrationCount = illustrationCount;
            packNumber = id;   // for image naming

            // ---- Image previews ----
            // Sort numerically
            imageEntries.sort((a, b) => {
                const numA = parseInt((a.name.match(/\d+/) || ['0'])[0], 10) || 0;
                const numB = parseInt((b.name.match(/\d+/) || ['0'])[0], 10) || 0;
                return numA - numB;
            });
            const firstThirty = imageEntries.slice(0, 30);

            revokeAllImageURLs();
            allImages = [];
            selectedIndices.clear();
            selectedOrder = [];

            for (let entry of firstThirty) {
                const blob = await entry.async('blob');
                const url = URL.createObjectURL(blob);
                allImages.push({
                    blob,
                    url,
                    name: entry.name,
                    originalName: entry.name
                });
            }

            // Show image section
            if (pmImageSection) pmImageSection.style.display = 'block';
            renderOriginalGrid();
            renderSelectedGrid();

            pmStatus.textContent = `📦 Ready: Pack #${id} | ${illustrationCount} images | ${price}`;
            pmUploadBtn.disabled = false;
            pmShowToast(`✅ ZIP analysed. Select images, set category & link, then click "Upload".`, 'info');

        } catch (err) {
            console.error(err);
            pmStatus.textContent = '❌ Failed to process pack.';
            pmShowToast(`Error: ${err.message}`, 'error');
            if (pmImageSection) pmImageSection.style.display = 'none';
            currentZipFile = null;
            currentPackEntry = null;
            pmUploadBtn.disabled = true;
        }
    }

    // ========== EVENT LISTENERS ==========
    if (pmDropzone) {
        pmDropzone.addEventListener('click', () => pmFileInput.click());
        pmDropzone.addEventListener('dragover', e => { e.preventDefault(); pmDropzone.style.borderColor = '#5a6e3c'; });
        pmDropzone.addEventListener('dragleave', () => { pmDropzone.style.borderColor = '#3a4050'; });
        pmDropzone.addEventListener('drop', e => {
            e.preventDefault();
            pmDropzone.style.borderColor = '#3a4050';
            const file = e.dataTransfer.files[0];
            if (file && file.name.toLowerCase().endsWith('.zip')) {
                processZip(file);
                const dt = new DataTransfer();
                dt.items.add(file);
                pmFileInput.files = dt.files;
            } else {
                pmShowToast('Please drop a .zip file', 'error');
            }
        });
    }
    if (pmFileInput) {
        pmFileInput.addEventListener('change', e => {
            if (e.target.files.length) processZip(e.target.files[0]);
        });
    }
    if (pmCategoryToggle) {
        pmCategoryToggle.addEventListener('change', () => {
            if (currentPackEntry) {
                currentPackEntry.category = pmCategoryToggle.checked ? 1 : 2;
                const catText = currentPackEntry.category === 1 ? 'Female' : 'Femboy';
                pmStatus.textContent = `📦 Ready: Pack #${currentPackEntry.id} | ${currentIllustrationCount} images | Category: ${catText}`;
            }
        });
    }
    if (pmRefreshBtn) pmRefreshBtn.addEventListener('click', loadAllPacks);
    if (pmSyncBtn) pmSyncBtn.addEventListener('click', async () => { /* unchanged */ });
    if (pmUploadBtn) {
        pmUploadBtn.addEventListener('click', uploadPackMetadataAndImages);
        pmUploadBtn.disabled = true;
    }

    bindSortHandlers();

    (async function init() {
        await checkRemoteHealth();
        await loadAllPacks();
        if (!remoteReachable) addOfflineWarning();
    })();
})();
