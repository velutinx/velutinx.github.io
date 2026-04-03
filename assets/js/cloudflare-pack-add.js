// ================================================
// cloudflare-pack-add.js
// External JS for Pack Manager (Cloudflare Worker)
// Hosted at: velutinx.github.io/assets/js/cloudflare-pack-add.js
// ================================================

const WORKER_URL = 'https://pack-list.velutinx.workers.dev/api/packs';

let toastContainer = null;

function ensureToastContainer() {
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    return toastContainer;
}

function showToast(message, type = 'success') {
    const container = ensureToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 10);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

function cleanFilename(rawName) {
    return rawName.replace(/\.zip$/i, '').replace(/\s*\(\d+\)\s*$/, '').trim();
}

function parseFilename(filename) {
    const base = cleanFilename(filename);
    const regex = /^\[Pack (\d+)\]\s+(.+?)\s*-\s*(.+)$/i;
    const match = base.match(regex);
    if (!match) return null;
    return {
        pack: match[1],
        character: match[2].trim(),
        series: match[3].trim().toUpperCase()
    };
}

function escapeHtml(str) {
    return String(str).replace(/[&<>]/g, m => {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ======================== FETCH & RENDER TABLE ========================
async function loadAllPacks() {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr class="empty-row"><td colspan="6"><span class="loading"></span> Fetching packs...</td></tr>';

    try {
        const response = await fetch(WORKER_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const packs = await response.json();
        renderTable(packs);
    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr class="empty-row"><td colspan="6">⚠️ Failed to load packs: ${err.message}</td></tr>`;
        showToast('Could not fetch pack list', 'error');
    }
}

function renderTable(packs) {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;

    if (!packs || packs.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="6">📭 No packs stored yet.</td></tr>';
        return;
    }

    packs.sort((a, b) => parseInt(a.id) - parseInt(b.id));

    tbody.innerHTML = packs.map(pack => {
        const categoryText = pack.category === 1 ? 'Female' : 'Femboy';
        const categoryClass = pack.category === 1 ? 'cat-female' : 'cat-femboy';
        const downloadCell = pack.downloadUrl && pack.downloadUrl.trim() !== ''
            ? `<a href="${escapeHtml(pack.downloadUrl)}" target="_blank" class="download-link">🔗 Link</a>`
            : '—';

        return `
            <tr>
                <td><code>${escapeHtml(pack.id)}</code></td>
                <td>${escapeHtml(pack.title)}</td>
                <td><span class="category-badge ${categoryClass}">${categoryText}</span></td>
                <td>${escapeHtml(pack.price)}</td>
                <td>${pack.illustrationCount}</td>
                <td>${downloadCell}</td>
            </tr>
        `;
    }).join('');
}

// ======================== STORE PACK ========================
async function storePack(packEntry) {
    const formData = new FormData();
    formData.append('id', packEntry.id);
    formData.append('title', packEntry.title);
    formData.append('category', packEntry.category);
    formData.append('price', packEntry.price);
    formData.append('illustrationCount', packEntry.illustrationCount);
    formData.append('downloadUrl', packEntry.downloadUrl || '');

    const response = await fetch(WORKER_URL, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${response.status}`);
    }
    return await response.json();
}

// ======================== PROCESS ZIP FILE ========================
async function processZip(file) {
    const statusDiv = document.getElementById('status');
    if (!statusDiv) return;

    statusDiv.textContent = '📂 Reading ZIP...';

    try {
        const zip = await JSZip.loadAsync(file);

        const imageEntries = [];
        zip.forEach((path, entry) => {
            if (!entry.dir && /\.(jpg|jpeg|png|gif|webp)$/i.test(path)) {
                imageEntries.push(entry);
            }
        });

        if (imageEntries.length === 0) {
            throw new Error('No images found in ZIP.');
        }

        const parsed = parseFilename(file.name);
        if (!parsed) {
            throw new Error('Filename does not match [Pack XXX] ... format.');
        }

        const packNumber = parsed.pack;
        const illustrationCount = imageEntries.length;
        const price = illustrationCount <= 45 ? "PRICE_1" : "PRICE_2";
        const isFemale = document.getElementById('categoryToggle').checked;
        const category = isFemale ? 1 : 2;
        const title = cleanFilename(file.name);
        const id = String(packNumber).padStart(3, '0');
        const downloadUrl = document.getElementById('downloadUrl').value.trim();

        const packEntry = {
            id,
            title,
            category,
            price,
            illustrationCount,
            downloadUrl: downloadUrl || null
        };

        statusDiv.textContent = `⏳ Sending pack #${packNumber}...`;

        const result = await storePack(packEntry);

        statusDiv.textContent = `✅ Pack #${packNumber} stored | ${illustrationCount} images | ${price} | ${isFemale ? 'Female' : 'Femboy'}`;

        showToast(`Pack ${packNumber} saved successfully`, 'success');

        // Refresh table
        await loadAllPacks();

    } catch (err) {
        console.error(err);
        statusDiv.textContent = `❌ ${err.message}`;
        showToast(`Error: ${err.message}`, 'error');
    }
}

// ======================== INITIALIZE ========================
function initPackManager() {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const refreshBtn = document.getElementById('refreshTableBtn');
    const categoryToggle = document.getElementById('categoryToggle');

    if (!dropzone || !fileInput) {
        console.error('Pack Manager elements not found. Make sure IDs match.');
        return;
    }

    // Click to select file
    dropzone.addEventListener('click', () => fileInput.click());

    // Drag & Drop
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = '#5a6e3c';
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.style.borderColor = '#3a4050';
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = '#3a4050';
        const file = e.dataTransfer.files[0];
        if (file && file.name.toLowerCase().endsWith('.zip')) {
            processZip(file);
        } else {
            showToast('Please drop a .zip file', 'error');
        }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            processZip(e.target.files[0]);
        }
    });

    // Category toggle re-process (if file is already selected)
    if (categoryToggle) {
        categoryToggle.addEventListener('change', () => {
            if (fileInput.files && fileInput.files.length > 0) {
                processZip(fileInput.files[0]);
            }
        });
    }

    // Refresh button
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadAllPacks);
    }

    // Initial load
    loadAllPacks();
}

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', initPackManager);

// Also expose globally in case you want to call manually
window.initPackManager = initPackManager;
window.loadAllPacks = loadAllPacks;
