// =====================================================
// cloudflare-pack-add.js
// All logic moved here - minimal HTML version
// =====================================================

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

    setTimeout(() => { toast.style.opacity = '1'; toast.style.transform = 'translateX(0)'; }, 10);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(30px)';
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
    return { pack: match[1] };
}

function escapeHtml(str) {
    return String(str).replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : m === '>' ? '&gt;' : m);
}

// Fetch and render table
async function loadAllPacks() {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr class="empty-row"><td colspan="6"><span class="loading"></span> Fetching packs...</td></tr>';

    try {
        const res = await fetch(WORKER_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const packs = await res.json();
        renderTable(packs);
    } catch (err) {
        tbody.innerHTML = `<tr class="empty-row"><td colspan="6">⚠️ Failed to load packs</td></tr>`;
        showToast('Could not fetch pack list', 'error');
    }
}

function renderTable(packs) {
    const tbody = document.getElementById('tableBody');
    if (!packs || packs.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="6">📭 No packs stored yet.</td></tr>';
        return;
    }
    packs.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    tbody.innerHTML = packs.map(p => {
        const catText = p.category === 1 ? 'Female' : 'Femboy';
        const catClass = p.category === 1 ? 'cat-female' : 'cat-femboy';
        const dl = p.downloadUrl ? `<a href="${escapeHtml(p.downloadUrl)}" target="_blank" class="download-link">🔗 Link</a>` : '—';
        return `<tr>
            <td><code>${escapeHtml(p.id)}</code></td>
            <td>${escapeHtml(p.title)}</td>
            <td><span class="category-badge ${catClass}">${catText}</span></td>
            <td>${escapeHtml(p.price)}</td>
            <td>${p.illustrationCount}</td>
            <td>${dl}</td>
        </tr>`;
    }).join('');
}

// Store pack
async function storePack(entry) {
    const fd = new FormData();
    fd.append('id', entry.id);
    fd.append('title', entry.title);
    fd.append('category', entry.category);
    fd.append('price', entry.price);
    fd.append('illustrationCount', entry.illustrationCount);
    fd.append('downloadUrl', entry.downloadUrl || '');

    const res = await fetch(WORKER_URL, { method: 'POST', body: fd });
    if (!res.ok) throw new Error('Failed to store pack');
    return res.json();
}

// Main ZIP processor
async function processZip(file) {
    const status = document.getElementById('status');
    status.textContent = '📂 Reading ZIP...';

    try {
        const zip = await JSZip.loadAsync(file);
        let imageCount = 0;
        zip.forEach((_, entry) => {
            if (!entry.dir && /\.(jpg|jpeg|png|gif|webp)$/i.test(entry.name)) imageCount++;
        });

        if (imageCount === 0) throw new Error('No images in ZIP');

        const parsed = parseFilename(file.name);
        if (!parsed) throw new Error('Invalid filename format');

        const packNum = parsed.pack;
        const price = imageCount <= 45 ? "PRICE_1" : "PRICE_2";
        const isFemale = document.getElementById('categoryToggle').checked;
        const category = isFemale ? 1 : 2;
        const title = cleanFilename(file.name);
        const id = String(packNum).padStart(3, '0');
        const downloadUrl = document.getElementById('downloadUrl').value.trim();

        const entryData = { id, title, category, price, illustrationCount: imageCount, downloadUrl: downloadUrl || null };

        status.textContent = `⏳ Sending pack #${packNum}...`;
        await storePack(entryData);

        status.textContent = `✅ Pack #${packNum} stored | ${imageCount} images | ${price}`;
        showToast(`Pack ${packNum} saved`, 'success');
        await loadAllPacks();
    } catch (err) {
        status.textContent = `❌ ${err.message}`;
        showToast(err.message, 'error');
    }
}

// Initialize everything
function init() {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const refreshBtn = document.getElementById('refreshTableBtn');
    const toggle = document.getElementById('categoryToggle');

    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.style.borderColor = '#5a6e3c'; });
    dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = '#3a4050'; });
    dropzone.addEventListener('drop', e => {
        e.preventDefault();
        dropzone.style.borderColor = '#3a4050';
        const file = e.dataTransfer.files[0];
        if (file?.name.toLowerCase().endsWith('.zip')) processZip(file);
        else showToast('Only .zip files allowed', 'error');
    });

    fileInput.addEventListener('change', e => e.target.files[0] && processZip(e.target.files[0]));

    if (toggle) {
        toggle.addEventListener('change', () => {
            if (fileInput.files?.length) processZip(fileInput.files[0]);
        });
    }

    if (refreshBtn) refreshBtn.addEventListener('click', loadAllPacks);

    loadAllPacks();
}

document.addEventListener('DOMContentLoaded', init);
