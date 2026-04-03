// ======================== CONFIGURATION ========================
const WORKER_URL = 'https://pack-list.velutinx.workers.dev/api/packs';

// ======================== UTILITIES ========================
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
        toast.style.transform = 'translateX(20px)';
        setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 200);
    }, 2500);
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
    return {
        pack: match[1],
        character: match[2].trim(),
        series: match[3].trim().toUpperCase()
    };
}
function escapeHtml(str) { 
    return String(str).replace(/[&<>]/g, function(m){ 
        if(m==='&') return '&amp;'; 
        if(m==='<') return '&lt;'; 
        if(m==='>') return '&gt;'; 
        return m;
    }); 
}

// ======================== FETCH & DISPLAY ALL PACKS ========================
async function loadAllPacks() {
    const tbody = document.getElementById('tableBody');
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
    if (!packs.length) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="6">📭 No packs stored yet. Upload a ZIP above.</td></tr>';
        return;
    }
    packs.sort((a,b) => parseInt(a.id) - parseInt(b.id));
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

// ======================== STORE PACK (POST) ========================
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

// ======================== PROCESS ZIP ========================
async function processZip(file) {
    const statusDiv = document.getElementById('status');
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
            statusDiv.textContent = '❌ No images found in ZIP.';
            showToast('No images found', 'error');
            return;
        }

        const parsed = parseFilename(file.name);
        if (!parsed) {
            statusDiv.textContent = '❌ Filename does not match [Pack XXX] ... format.';
            showToast('Invalid filename format', 'error');
            return;
        }

        const packNumber = parsed.pack;
        const illustrationCount = imageEntries.length;
        const price = illustrationCount <= 45 ? "PRICE_1" : "PRICE_2";

        const categoryToggle = document.getElementById('categoryToggle');
        const isFemale = categoryToggle.checked;
        const category = isFemale ? 1 : 2;

        const title = cleanFilename(file.name);
        const id = String(packNumber).padStart(3, '0');

        const downloadUrlInput = document.getElementById('downloadUrl');
        const downloadUrl = downloadUrlInput.value.trim();

        const packEntry = {
            id: id,
            title: title,
            category: category,
            price: price,
            illustrationCount: illustrationCount,
            downloadUrl: downloadUrl || null
        };

        statusDiv.textContent = `⏳ Sending pack #${packNumber}...`;
        const result = await storePack(packEntry);
        statusDiv.textContent = `✅ Pack #${packNumber} stored (index ${result.index}) | ${illustrationCount} images | ${price} | ${isFemale ? 'Female' : 'Femboy'} | ${downloadUrl ? 'link saved' : 'no link'}`;
        showToast(`Pack ${packNumber} saved to KV`, 'success');
        
        await loadAllPacks();
    } catch (err) {
        console.error(err);
        statusDiv.textContent = '❌ Failed to store pack.';
        showToast(`Error: ${err.message}`, 'error');
    }
}

// ======================== EVENT LISTENERS ========================
document.addEventListener('DOMContentLoaded', () => {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const categoryToggle = document.getElementById('categoryToggle');
    const refreshBtn = document.getElementById('refreshTableBtn');

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = '#5a6e3c'; });
    dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = '#3a4050'; });
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = '#3a4050';
        const file = e.dataTransfer.files[0];
        if (file && file.name.toLowerCase().endsWith('.zip')) {
            processZip(file);
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;
        } else {
            showToast('Please drop a .zip file', 'error');
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) processZip(e.target.files[0]);
    });

    categoryToggle.addEventListener('change', () => {
        if (fileInput.files && fileInput.files.length > 0) processZip(fileInput.files[0]);
    });

    refreshBtn.addEventListener('click', () => loadAllPacks());

    loadAllPacks();
});
