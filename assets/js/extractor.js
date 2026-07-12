// assets/js/extractor.js
(function() {
    'use strict';

    const dropZone = document.getElementById('extractorDropZone');
    const fileInput = document.getElementById('extractorFileInput');
    const statusEl = document.getElementById('extractorStatus');
    const outputText = document.getElementById('extractorOutput');
    const downloadBtn = document.getElementById('extractorDownloadBtn');
    const clearBtn = document.getElementById('extractorClearBtn');
    const fileCount = document.getElementById('extractorFileCount');

    const IGNORED_FILES = new Set([
        'metadata.json',
        '.gitignore',
        'sitemap.xml',
        'wrangler.toml',
        'robots.txt',
        'README.md',
        'CNAME',
        '.nojekyll'
    ]);

    function setStatus(msg, isError = false) {
        statusEl.textContent = msg;
        statusEl.className = 'extractor-status' + (isError ? ' error' : '');
    }

    function setLoading(loading) {
        if (loading) {
            statusEl.innerHTML = '<span class="spinner"></span> Extracting…';
            statusEl.className = 'extractor-status';
        }
    }

    function updateOutput(text, count) {
        outputText.value = text;
        fileCount.textContent = count + ' file' + (count !== 1 ? 's' : '');
        downloadBtn.disabled = (count === 0 || text.trim() === '');
    }

    function clearAll() {
        outputText.value = '';
        fileCount.textContent = '0 files';
        downloadBtn.disabled = true;
        setStatus('✨ Cleared');
    }

    async function processZipFile(file) {
        const zipName = file.name;
        const arrayBuffer = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);

        const textExtensions = [
            '.txt', '.html', '.htm', '.js', '.css', '.json', '.xml', '.svg',
            '.md', '.yaml', '.yml', '.csv', '.log', '.sh', '.py', '.java',
            '.c', '.cpp', '.h', '.hpp', '.php', '.rb', '.go', '.rs', '.swift',
            '.kt', '.ts', '.jsx', '.tsx', '.vue', '.svelte'
        ];

        const fileEntries = [];

        for (const [path, zipEntry] of Object.entries(zip.files)) {
            if (zipEntry.dir) continue;
            if (zipEntry._data && zipEntry._data.uncompressedSize === 0) continue;

            // ─── NEW: skip files inside .wrangler or node_modules folders ───
            const segments = path.split('/');
            if (segments.includes('.wrangler') || segments.includes('node_modules')) {
                continue;
            }

            const fileName = path.split('/').pop() || path;
            if (IGNORED_FILES.has(fileName)) continue;

            const ext = '.' + fileName.split('.').slice(1).join('.');
            const isText = textExtensions.some(e => ext.toLowerCase() === e.toLowerCase()) ||
                /\.(txt|html?|js|css|json|xml|svg|md|ya?ml|csv|log|sh|py|java|cpp?|h|hpp|php|rb|go|rs|swift|kt|ts|jsx|tsx|vue|svelte)$/i.test(path);

            if (!isText) continue;

            try {
                const content = await zipEntry.async('string');
                fileEntries.push({ path, content });
            } catch (_) { /* skip binary */ }
        }

        if (fileEntries.length === 0) return null;

        const rootFiles = [];
        const folderFiles = [];
        for (const entry of fileEntries) {
            if (entry.path.includes('/')) folderFiles.push(entry);
            else rootFiles.push(entry);
        }

        rootFiles.sort((a, b) => a.path.localeCompare(b.path));
        folderFiles.sort((a, b) => a.path.localeCompare(b.path));
        const sortedEntries = [...rootFiles, ...folderFiles];

        const parts = [];
        parts.push(`//// ${zipName}`);
        parts.push('------------------');
        for (let i = 0; i < sortedEntries.length; i++) {
            const { path, content } = sortedEntries[i];
            parts.push('*/' + path);
            parts.push(content);
            if (i < sortedEntries.length - 1) parts.push('------------------');
        }

        return {
            zipName,
            content: parts.join('\n'),
            count: sortedEntries.length
        };
    }

    async function handleFiles(files) {
        if (!files || files.length === 0) {
            setStatus('⚠️ No files selected.', true);
            return;
        }

        const zipFiles = Array.from(files).filter(f =>
            f.type === 'application/zip' || f.name.toLowerCase().endsWith('.zip')
        );

        if (zipFiles.length === 0) {
            setStatus('⚠️ Please drop valid .zip files.', true);
            return;
        }

        setLoading(true);

        const results = [];
        let totalEntries = 0;

        for (let i = 0; i < zipFiles.length; i++) {
            const file = zipFiles[i];
            try {
                const result = await processZipFile(file);
                if (result) {
                    results.push(result);
                    totalEntries += result.count;
                    setStatus(`⏳ Processed ${i+1}/${zipFiles.length} – ${result.count} files in "${file.name}"`);
                } else {
                    setStatus(`⚠️ No text files found in "${file.name}" (ignored files excluded)`, true);
                }
            } catch (err) {
                console.error(err);
                setStatus(`❌ Failed to extract ${file.name}: ${err.message}`, true);
            }
        }

        if (results.length === 0) {
            setStatus('⚠️ No text files extracted from any ZIP.', true);
            updateOutput('', 0);
            setLoading(false);
            return;
        }

        const combinedParts = [];
        for (let i = 0; i < results.length; i++) {
            const r = results[i];
            combinedParts.push(r.content);
            if (i < results.length - 1) {
                combinedParts.push('------------------');
                combinedParts.push('==================');
                combinedParts.push('------------------');
            }
        }

        const finalText = combinedParts.join('\n');
        updateOutput(finalText, totalEntries);
        setStatus(`✅ Extracted ${totalEntries} text file${totalEntries > 1 ? 's' : ''} from ${results.length} ZIP${results.length > 1 ? 's' : ''}.`);
        setLoading(false);
    }

    // ── Event listeners ──
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) handleFiles(files);
    });

    dropZone.addEventListener('click', (e) => {
        if (e.target === dropZone || e.target.closest('.extractor-drop-zone') === dropZone) {
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleFiles(e.target.files);
        fileInput.value = '';
    });

    downloadBtn.addEventListener('click', () => {
        const content = outputText.value;
        if (!content.trim()) {
            setStatus('⚠️ Nothing to download.', true);
            return;
        }
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'combined_extracted.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setStatus(`⬇️ Downloaded as "combined_extracted.txt"`);
    });

    clearBtn.addEventListener('click', clearAll);

    clearAll();

    document.addEventListener('paste', (e) => {
        const items = e.clipboardData && e.clipboardData.items;
        if (!items) return;
        const files = [];
        for (const item of items) {
            if (item.type === 'application/zip' || item.type === 'application/x-zip-compressed') {
                const file = item.getAsFile();
                if (file) files.push(file);
            }
        }
        if (files.length > 0) handleFiles(files);
    });
})();
