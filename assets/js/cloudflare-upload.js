// cloudflare-upload.js – reusable ZIP image selector + upload to Cloudflare R2 (classic script)

(function() {
    const UPLOAD_WORKER_URL = 'https://i2-uploader.velutinx.workers.dev';

    // Toast system (same as before)
    let toastContainer = null;
    function ensureToastContainer() {
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'cf-toast-container';
            document.body.appendChild(toastContainer);
        }
        return toastContainer;
    }
    function showToast(message, type = 'success') {
        const container = ensureToastContainer();
        const toast = document.createElement('div');
        toast.className = `cf-toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '1'; toast.style.transform = 'translateX(0)'; }, 10);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(20px)';
            setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 200);
        }, 2500);
    }

    // Helper functions (cleanFilename, parseFilename, extractNumber) same as before
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
    function extractNumber(filename) {
        const match = filename.match(/\d+/);
        return match ? parseInt(match[0], 10) : Infinity;
    }

    window.initCloudflareUploader = function(elementIds) {
        const dropzone = document.getElementById(elementIds.dropzone);
        const fileInput = document.getElementById(elementIds.fileInput);
        const statusDiv = document.getElementById(elementIds.status);
        const originalGrid = document.getElementById(elementIds.originalGrid);
        const selectedGrid = document.getElementById(elementIds.selectedGrid);
        const downloadBtn = document.getElementById(elementIds.downloadBtn);

        if (!dropzone || !fileInput || !statusDiv || !originalGrid || !selectedGrid || !downloadBtn) {
            console.error('Cloudflare uploader: missing required DOM elements', elementIds);
            return;
        }

        let allImages = [];
        let selectedIndices = new Set();
        let selectedOrder = [];
        let packNumber = null;
        let sortable = null;

        // ----- Functions to render and manipulate UI -----
        function revokeAllURLs() {
            allImages.forEach(img => { if (img.url) URL.revokeObjectURL(img.url); });
        }

        function renderOriginal() {
            originalGrid.innerHTML = '';
            const toShow = allImages.slice(0, 10);
            toShow.forEach((img, idx) => {
                const isSelected = selectedIndices.has(idx);
                const thumb = document.createElement('img');
                thumb.className = 'cf-thumbnail';
                thumb.src = img.url;
                thumb.title = img.originalName;
                thumb.style.border = isSelected ? '3px solid #2c6e2c' : '2px solid transparent';
                thumb.onclick = () => toggleSelection(idx);
                originalGrid.appendChild(thumb);
            });
        }

        function renderSelected() {
            selectedGrid.innerHTML = '';
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
                    removeFromSelection(idx);
                };
                wrapper.appendChild(thumb);
                wrapper.appendChild(removeBtn);
                selectedGrid.appendChild(wrapper);
            }
            if (sortable) sortable.destroy();
            sortable = new Sortable(selectedGrid, {
                animation: 150,
                onEnd: () => {
                    const newOrder = [];
                    Array.from(selectedGrid.children).forEach(child => {
                        const idx = parseInt(child.dataset.index, 10);
                        if (!isNaN(idx)) newOrder.push(idx);
                    });
                    selectedOrder = newOrder;
                }
            });
        }

        function toggleSelection(idx) {
            if (selectedIndices.has(idx)) {
                selectedIndices.delete(idx);
                const pos = selectedOrder.indexOf(idx);
                if (pos !== -1) selectedOrder.splice(pos, 1);
            } else {
                selectedIndices.add(idx);
                selectedOrder.push(idx);
            }
            renderOriginal();
            renderSelected();
            // Update shared state
            if (window.sharedZipData) {
                window.sharedZipData.selectedIndices = new Set(selectedIndices);
                window.sharedZipData.selectedOrder = [...selectedOrder];
            }
        }

        function removeFromSelection(idx) {
            if (selectedIndices.has(idx)) {
                selectedIndices.delete(idx);
                const pos = selectedOrder.indexOf(idx);
                if (pos !== -1) selectedOrder.splice(pos, 1);
                renderOriginal();
                renderSelected();
                if (window.sharedZipData) {
                    window.sharedZipData.selectedIndices = new Set(selectedIndices);
                    window.sharedZipData.selectedOrder = [...selectedOrder];
                }
            }
        }

        // Load shared data into the Cloudflare UI
        function loadSharedData(sharedData) {
            if (!sharedData || !sharedData.allImages) return;
            revokeAllURLs();
            allImages = sharedData.allImages.map(img => ({ ...img })); // shallow copy
            packNumber = sharedData.packNumber;
            selectedIndices = sharedData.selectedIndices ? new Set(sharedData.selectedIndices) : new Set();
            selectedOrder = sharedData.selectedOrder ? [...sharedData.selectedOrder] : [];
            renderOriginal();
            renderSelected();
            statusDiv.textContent = `✅ Loaded ${allImages.length} images from shared ZIP. Pack #${packNumber}`;
            showToast(`Cloudflare tab synced with Pack #${packNumber}`, 'info');
        }

        // Process ZIP file (local drag/drop) and also update shared state
        async function processZip(file) {
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
                packNumber = parsed.pack;
                statusDiv.textContent = `📸 Found ${imageEntries.length} images. Extracting first 10... (Pack #${packNumber})`;
                imageEntries.sort((a, b) => extractNumber(a.name) - extractNumber(b.name));
                const firstTen = imageEntries.slice(0, 10);
                revokeAllURLs();
                allImages = [];
                selectedIndices.clear();
                selectedOrder = [];
                for (let i = 0; i < firstTen.length; i++) {
                    const entry = firstTen[i];
                    const blob = await entry.async('blob');
                    const url = URL.createObjectURL(blob);
                    allImages.push({
                        blob,
                        url,
                        name: entry.name,
                        originalName: entry.name
                    });
                }
                renderOriginal();
                renderSelected();
                statusDiv.textContent = `✅ Loaded ${allImages.length} images. Click to select, drag to reorder.`;
                showToast(`ZIP loaded. Pack #${packNumber}`, 'success');

                // Update shared state
                if (window.sharedZipData) {
                    window.sharedZipData.allImages = allImages;
                    window.sharedZipData.packNumber = packNumber;
                    window.sharedZipData.selectedIndices = selectedIndices;
                    window.sharedZipData.selectedOrder = selectedOrder;
                    window.sharedZipData.source = 'cloudflare';
                } else {
                    window.sharedZipData = {
                        packNumber: packNumber,
                        allImages: allImages,
                        selectedIndices: new Set(selectedIndices),
                        selectedOrder: [...selectedOrder],
                        source: 'cloudflare'
                    };
                }
            } catch (err) {
                console.error(err);
                statusDiv.textContent = '❌ Error reading ZIP file.';
                showToast('Failed to read ZIP', 'error');
            }
        }

        // Upload and download functions (unchanged)
        async function uploadSelectedToR2() {
            if (!packNumber) {
                showToast('Pack number missing – please load a valid ZIP first', 'error');
                return false;
            }
            if (selectedOrder.length === 0) {
                showToast('No images selected to upload', 'error');
                return false;
            }
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
            showToast('📡 Uploading to Cloudflare...', 'info');
            try {
                const res = await fetch(UPLOAD_WORKER_URL, {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                if (res.ok) {
                    showToast(`✅ Uploaded ${data.urls.length} images to /i/`, 'success');
                    console.log('Uploaded URLs:', data.urls);
                    return true;
                } else {
                    throw new Error(data.error || 'Upload failed');
                }
            } catch (err) {
                console.error('Upload error:', err);
                showToast(`❌ Upload failed: ${err.message}`, 'error');
                return false;
            }
        }

        async function downloadSelectedLocally() {
            if (!packNumber) {
                showToast('Pack number missing – please load a valid ZIP first', 'error');
                return false;
            }
            if (selectedOrder.length === 0) {
                showToast('No images selected to download', 'error');
                return false;
            }
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
            showToast(`📥 Downloaded ${successCount} file(s)`, 'success');
            statusDiv.textContent = `✅ ${successCount} files downloaded.`;
            return true;
        }

        async function handleAction() {
            if (!packNumber) {
                showToast('Please load a ZIP file first', 'error');
                return;
            }
            if (selectedOrder.length === 0) {
                showToast('No images selected', 'error');
                return;
            }
            const downloadPromise = downloadSelectedLocally();
            const uploadPromise = uploadSelectedToR2();
            await Promise.allSettled([downloadPromise, uploadPromise]);
        }

        // Event listeners for this tab
        dropzone.addEventListener('click', () => fileInput.click());
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
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                processZip(e.target.files[0]);
                fileInput.value = '';
            }
        });
        downloadBtn.addEventListener('click', handleAction);

        // Listen for shared data updates from other tab
        window.addEventListener('zipDataUpdated', (event) => {
            const data = event.detail;
            if (data && data.allImages && data.source !== 'cloudflare') {
                loadSharedData(data);
                // Also update local selections from shared data
                selectedIndices = data.selectedIndices ? new Set(data.selectedIndices) : new Set();
                selectedOrder = data.selectedOrder ? [...data.selectedOrder] : [];
                renderOriginal();
                renderSelected();
            }
        });

        // If shared data already exists (e.g., after page load if Subscribestar tab loaded a ZIP first), load it
        if (window.sharedZipData && window.sharedZipData.allImages) {
            loadSharedData(window.sharedZipData);
        }
    };
})();
