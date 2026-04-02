// zip-to-post.js – Handles zip parsing, Subscribestar & Patreon post generation, copy with toast notifications

document.addEventListener('DOMContentLoaded', function() {
    // ----- Toast notification (global, reusable) -----
    function showToast(message, type = 'info') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.position = 'fixed';
            container.style.top = '20px';
            container.style.right = '20px';
            container.style.zIndex = '10000';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.gap = '10px';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.textContent = message;
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        toast.style.transition = 'opacity 0.2s, transform 0.2s';
        container.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '1'; toast.style.transform = 'translateX(0)'; }, 10);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(20px)';
            setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 200);
        }, 2500);
    }

    // ----- Attach copy handlers to all buttons with data-copy attribute -----
    document.querySelectorAll('.copy-btn').forEach(btn => {
        const targetId = btn.getAttribute('data-copy');
        if (targetId) {
            btn.addEventListener('click', () => {
                const textarea = document.getElementById(targetId);
                if (textarea) {
                    textarea.select();
                    textarea.setSelectionRange(0, 99999);
                    document.execCommand('copy');
                    showToast('📋 Copied to clipboard!', 'success');
                }
            });
        }
    });

    // ----- DOM elements for zip processing -----
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const subscriberOutput = document.getElementById('subscriberOutput');
    const publicOutput = document.getElementById('publicOutput');
    const patreonSubOutput = document.getElementById('patreonSubOutput');
    const patreonPublicOutput = document.getElementById('patreonPublicOutput');
    const pixivOutput = document.getElementById('pixivOutput');
    const filenameHint = document.getElementById('filenameHint');

    if (!dropZone || !fileInput) return;

    // ----- Helper: update shared state and notify Cloudflare tab -----
    function updateSharedState(zipData) {
        window.sharedZipData = zipData;
        // Dispatch a custom event so Cloudflare tab can react
        window.dispatchEvent(new CustomEvent('zipDataUpdated', { detail: zipData }));
    }

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#5a6e3c';
    });
    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = '#3a4050';
    });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#3a4050';
        const files = e.dataTransfer.files;
        if (files.length) handleFile(files[0]);
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
        fileInput.value = '';
    });

    // Clean filename, parseFilename, normalize, findPackId same as before...
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
    function normalize(str) {
        return str.toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    async function findPackId(character, fileCount) {
        try {
            const module = await import('/assets/js/packs-data.js');
            const packs = module.default;
            const normalizedChar = normalize(character);
            for (const pack of packs) {
                const match = pack.title.match(/^\[Pack \d+\]\s+(.+?)\s*-\s*(.+)$/i);
                if (!match) continue;
                const packChar = match[1].trim();
                if (normalize(packChar) === normalizedChar && pack.illustrationCount === fileCount) {
                    return pack.id;
                }
            }
            return null;
        } catch (err) {
            console.warn('Failed to load packs-data.js', err);
            return null;
        }
    }

    async function handleFile(file) {
        if (!file.name.toLowerCase().endsWith('.zip')) {
            showToast('❌ Please select a .zip file', 'error');
            return;
        }
        filenameHint.textContent = `Processing: ${file.name}`;
        subscriberOutput.value = 'Reading zip...';
        publicOutput.value = 'Reading zip...';
        patreonSubOutput.value = 'Reading zip...';
        patreonPublicOutput.value = 'Reading zip...';
        if (pixivOutput) pixivOutput.value = 'Reading zip...';

        const parsed = parseFilename(file.name);
        if (!parsed) {
            const errMsg = '❌ Filename format not recognized.\nExpected: [Pack 123] Character - SERIES.zip\n(Optional (number) suffix is ignored)';
            subscriberOutput.value = errMsg;
            publicOutput.value = errMsg;
            patreonSubOutput.value = errMsg;
            patreonPublicOutput.value = errMsg;
            if (pixivOutput) pixivOutput.value = errMsg;
            filenameHint.textContent = 'Error: invalid filename format';
            showToast('Invalid filename format', 'error');
            return;
        }

        const { series, character, pack } = parsed;

        try {
            const zip = await JSZip.loadAsync(file);
            let fileCount = 0;
            zip.forEach((_, entry) => { if (!entry.dir) fileCount++; });

            // Generate posts (same as before)
            subscriberOutput.value = `[${series}] ${character} — Pack #${pack}\n\nSet size: ${fileCount} images\n\n📌 Suggestive preview below\n🔒 Full explicit pack available for paid supporters`;
            publicOutput.value = `[${series}] ${character} — Pack #${pack}\n\nSet size: ${fileCount} images\n\n⚠️ Disclaimer: All characters depicted are portrayed as 18+. This is a fictional, consensual depiction.`;
            patreonSubOutput.value = `${character} — Pack #${pack}\n\n${fileCount} Total Images\n\n📌 Suggestive previews are shown in the gallery below. The full archive link contains the complete uncensored collection.\n\n⚠️ Disclaimer: All characters depicted are portrayed as 18+. This is a fictional, consensual AI-generated depiction.`;
            patreonPublicOutput.value = `Preview: ${character} — ${series} — Pack ${pack}\n\nTotal Set Size: ${fileCount} High-Res Images\n\n🔒 Unlock the full high-resolution pack and explicit versions by joining the Weekly Access tier or higher.\n\n⚠️ Disclaimer: All characters depicted are portrayed as 18+. This is a fictional, consensual AI-generated depiction.`;

            const packId = await findPackId(character, fileCount);
            const link = packId ? `https://velutinx.com/s/pack?id=${packId}` : 'https://velutinx.com/store';
            const pixivText = `全${fileCount}枚 / Full set: ${fileCount} images\n${link}\n\n📌 もっと私の作品を見たい方はこちら ♡  \nFind more of my work & social links:  \n🔗 https://velutinx.com/\n\n免責事項：本イラストに登場するキャラクターは、18歳以上として描写されています。  \nDisclaimer: This illustration depicts a fictional character who is portrayed as being 18 years of age or older.`;            if (pixivOutput) pixivOutput.value = pixivText;

            filenameHint.textContent = `✅ Found ${fileCount} files. | Pixiv post ready.`;
            showToast(`✅ Processed ${fileCount} images`, 'success');

            // ----- Extract first 10 images for shared state -----
            const imageEntries = [];
            zip.forEach((path, entry) => {
                if (!entry.dir && /\.(jpg|jpeg|png|gif|webp)$/i.test(path)) {
                    imageEntries.push(entry);
                }
            });
            imageEntries.sort((a, b) => {
                const numA = (a.name.match(/\d+/) || [0])[0];
                const numB = (b.name.match(/\d+/) || [0])[0];
                return parseInt(numA, 10) - parseInt(numB, 10);
            });
            const firstTen = imageEntries.slice(0, 10);
            const allImages = [];
            for (let entry of firstTen) {
                const blob = await entry.async('blob');
                const url = URL.createObjectURL(blob);
                allImages.push({
                    blob,
                    url,
                    name: entry.name,
                    originalName: entry.name
                });
            }
            updateSharedState({
                packNumber: pack,
                allImages: allImages,
                selectedIndices: new Set(),
                selectedOrder: [],
                source: 'subscribestar'
            });
        } catch (err) {
            console.error(err);
            subscriberOutput.value = '❌ Error reading zip file.';
            publicOutput.value = '❌ Error reading zip file.';
            patreonSubOutput.value = '❌ Error reading zip file.';
            patreonPublicOutput.value = '❌ Error reading zip file.';
            if (pixivOutput) pixivOutput.value = '❌ Error reading zip file.';
            filenameHint.textContent = 'Error: could not read zip contents.';
            showToast('❌ Failed to read zip file', 'error');
        }
    }
});
