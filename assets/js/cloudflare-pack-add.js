// cloudflare-pack-add.js - Final minimal version
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
function showToast(msg, type = 'success') {
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = msg;
    ensureToastContainer().appendChild(t);
    setTimeout(() => t.style.cssText = 'opacity:1;transform:translateX(0)', 10);
    setTimeout(() => { t.style.cssText = 'opacity:0;transform:translateX(30px)'; setTimeout(() => t.remove(), 300); }, 2500);
}

function cleanFilename(n) { return n.replace(/\.zip$/i,'').replace(/\s*\(\d+\)\s*$/,'').trim(); }
function parseFilename(n) {
    const m = cleanFilename(n).match(/^\[Pack (\d+)\]/i);
    return m ? {pack: m[1]} : null;
}
function escapeHtml(s) { return String(s).replace(/[&<>]/g, m => m==='&'?'&amp;':m==='<''&lt;':m==='>'?'&gt;':m); }

async function loadAllPacks() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '<tr class="empty-row"><td colspan="6"><span class="loading"></span> Fetching...</td></tr>';
    try {
        const r = await fetch(WORKER_URL);
        if (!r.ok) throw new Error();
        renderTable(await r.json());
    } catch { 
        tbody.innerHTML = '<tr class="empty-row"><td colspan="6">Failed to load packs</td></tr>';
        showToast('Could not fetch pack list', 'error');
    }
}
function renderTable(packs) {
    const tbody = document.getElementById('tableBody');
    if (!packs?.length) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="6">No packs stored yet.</td></tr>';
        return;
    }
    packs.sort((a,b)=>parseInt(a.id)-parseInt(b.id));
    tbody.innerHTML = packs.map(p => {
        const c = p.category === 1 ? 'Female' : 'Femboy';
        const cc = p.category === 1 ? 'cat-female' : 'cat-femboy';
        const dl = p.downloadUrl ? `<a href="${escapeHtml(p.downloadUrl)}" target="_blank" class="download-link">🔗 Link</a>` : '—';
        return `<tr><td><code>${escapeHtml(p.id)}</code></td><td>${escapeHtml(p.title)}</td><td><span class="category-badge ${cc}">${c}</span></td><td>${escapeHtml(p.price)}</td><td>${p.illustrationCount}</td><td>${dl}</td></tr>`;
    }).join('');
}

async function storePack(e) {
    const f = new FormData();
    f.append('id', e.id); f.append('title', e.title); f.append('category', e.category);
    f.append('price', e.price); f.append('illustrationCount', e.illustrationCount);
    f.append('downloadUrl', e.downloadUrl || '');
    const r = await fetch(WORKER_URL, {method:'POST', body:f});
    if (!r.ok) throw new Error('Store failed');
    return r.json();
}

async function processZip(file) {
    const status = document.getElementById('status');
    status.textContent = '📂 Reading ZIP...';
    try {
        const zip = await JSZip.loadAsync(file);
        let count = 0;
        zip.forEach((_,e) => { if (!e.dir && /\.(jpe?g|png|gif|webp)$/i.test(e.name)) count++; });
        if (!count) throw new Error('No images');

        const p = parseFilename(file.name);
        if (!p) throw new Error('Invalid filename');

        const num = p.pack;
        const price = count <= 45 ? "PRICE_1" : "PRICE_2";
        const female = document.getElementById('categoryToggle').checked;
        const cat = female ? 1 : 2;
        const title = cleanFilename(file.name);
        const id = String(num).padStart(3,'0');
        const url = document.getElementById('downloadUrl').value.trim();

        await storePack({id, title, category:cat, price, illustrationCount:count, downloadUrl: url||null});

        status.textContent = `✅ Pack #${num} stored | ${count} images`;
        showToast(`Pack ${num} saved`, 'success');
        loadAllPacks();
    } catch (err) {
        status.textContent = `❌ ${err.message}`;
        showToast(err.message, 'error');
    }
}

function init() {
    const dz = document.getElementById('dropzone');
    const fi = document.getElementById('fileInput');
    const ref = document.getElementById('refreshTableBtn');
    const tog = document.getElementById('categoryToggle');

    dz.addEventListener('click', () => fi.click());
    dz.addEventListener('dragover', e => {e.preventDefault(); dz.style.borderColor='#5a6e3c';});
    dz.addEventListener('dragleave', () => dz.style.borderColor='#3a4050');
    dz.addEventListener('drop', e => {
        e.preventDefault(); dz.style.borderColor='#3a4050';
        const f = e.dataTransfer.files[0];
        if (f?.name.toLowerCase().endsWith('.zip')) processZip(f);
        else showToast('Only .zip allowed', 'error');
    });
    fi.addEventListener('change', e => e.target.files[0] && processZip(e.target.files[0]));
    if (tog) tog.addEventListener('change', () => fi.files?.length && processZip(fi.files[0]));
    if (ref) ref.addEventListener('click', loadAllPacks);

    loadAllPacks();
}

document.addEventListener('DOMContentLoaded', init);
