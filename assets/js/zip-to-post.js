// /assets/js/zip-to-post.js
// Handles zip parsing, Subscribestar & Patreon post generation, copy with toast notifications
// v2: automatically removes (number) suffix from filenames (e.g., "(1)" before parsing)

(function() {
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
    const filenameHint = document.getElementById('filenameHint');

    if (!dropZone || !fileInput) return; // exit if not on Subscribestar tab

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
    });

    // Clean filename: remove trailing (number) and any extra spaces
    function cleanFilename(rawName) {
        let name = rawName.replace(/\.zip$/i, '');
        // Remove (1), (2), (123) etc. at the end (including possible space before)
        name = name.replace(/\s*\(\d+\)\s*$/, '');
        // Also remove any standalone (number) anywhere (but keep it simple: just trailing)
        // If there are multiple, this will clean the last one; good enough for duplicates.
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

    function handleFile(file) {
        if (!file.name.toLowerCase().endsWith('.zip')) {
            showToast('❌ Please select a .zip file', 'error');
            return;
        }
        filenameHint.textContent = `Processing: ${file.name}`;
        subscriberOutput.value = 'Reading zip...';
        publicOutput.value = 'Reading zip...';
        patreonSubOutput.value = 'Reading zip...';
        patreonPublicOutput.value = 'Reading zip...';

        const parsed = parseFilename(file.name);
        if (!parsed) {
            const errMsg = '❌ Filename format not recognized.\nExpected: [Pack 123] Character - SERIES.zip\n(Optional (number) suffix is ignored)';
            subscriberOutput.value = errMsg;
            publicOutput.value = errMsg;
            patreonSubOutput.value = errMsg;
            patreonPublicOutput.value = errMsg;
            filenameHint.textContent = 'Error: invalid filename format';
            showToast('Invalid filename format', 'error');
            return;
        }

        const { series, character, pack } = parsed;

        JSZip.loadAsync(file)
            .then(zip => {
                let fileCount = 0;
                zip.forEach((_, entry) => { if (!entry.dir) fileCount++; });

                // Subscribestar posts
                subscriberOutput.value = `[${series}] ${character} — Pack #${pack}\n\nSet size: ${fileCount} images\n\n📌 Suggestive preview below\n🔒 Full explicit pack available for paid supporters`;
                publicOutput.value = `[${series}] ${character} — Pack #${pack}\n\nSet size: ${fileCount} images\n\n⚠️ Disclaimer: All characters depicted are portrayed as 18+. This is a fictional, consensual depiction.`;

                // Patreon posts
                patreonSubOutput.value = `${character} — Pack #${pack}\n\n${fileCount} Total Images\n\n📌 Suggestive previews are shown in the gallery below. The full archive link contains the complete uncensored collection.\n\n⚠️ Disclaimer: All characters depicted are portrayed as 18+. This is a fictional, consensual AI-generated depiction.`;
                patreonPublicOutput.value = `Preview: ${character} — ${series} — Pack ${pack}\n\nTotal Set Size: ${fileCount} High-Res Images\n\n🔒 Unlock the full high-resolution pack and explicit versions by joining the Weekly Access tier or higher.\n\n⚠️ Disclaimer: All characters depicted are portrayed as 18+. This is a fictional, consensual AI-generated depiction.`;

                filenameHint.textContent = `✅ Found ${fileCount} files in zip. | Patreon posts ready.`;
                showToast(`✅ Processed ${fileCount} images`, 'success');
            })
            .catch(err => {
                console.error(err);
                subscriberOutput.value = '❌ Error reading zip file.';
                publicOutput.value = '❌ Error reading zip file.';
                patreonSubOutput.value = '❌ Error reading zip file.';
                patreonPublicOutput.value = '❌ Error reading zip file.';
                filenameHint.textContent = 'Error: could not read zip contents.';
                showToast('❌ Failed to read zip file', 'error');
            });
    }
})();
