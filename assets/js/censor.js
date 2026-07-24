// assets/js/censor.js – Velutinx Censorship Tool
(function() {
    'use strict';

    // ----- DOM refs -----
    const canvas = document.getElementById('censorCanvas');
    if (!canvas) return; // Failsafe: Stops script if element doesn't exist on page
    
    const ctx = canvas.getContext('2d');
    const dropZone = document.getElementById('censor-dropZone');
    const addButton = document.getElementById('censor-addBtn');
    const saveButton = document.getElementById('censor-saveBtn');
    const canvasWrapper = document.getElementById('censor-canvasWrapper');

    // ----- Load censorship image -----
    const censorImage = new Image();
    censorImage.crossOrigin = 'anonymous';
    censorImage.src = 'https://www.velutinx.com/images/Censoring.png';

    // ----- State -----
    let originalImage = null;
    let originalFileName = 'image';
    let imageLoaded = false;
    let darkOverlay = false;

    const editor = {
        x: 0,
        y: 0,
        size: 180,
        visible: false,
    };

    const HANDLE_SIZE = 16;
    const MIN_SIZE = 32;
    let maxSize = 2000;

    let canvasScale = 1;

    // ----- Helper: Check if tab is active -----
    function isCensorTabActive() {
        const censorTab = document.getElementById('censor');
        return censorTab ? censorTab.classList.contains('active') : false;
    }

    // ----- Fit canvas inside wrapper (contain, with slight upscale) -----
    function fitCanvas(img) {
        const wrapperRect = canvasWrapper.getBoundingClientRect();
        const availWidth = wrapperRect.width - 12;
        const availHeight = wrapperRect.height - 12;

        const imgW = img.width;
        const imgH = img.height;

        let scaleX = availWidth / imgW;
        let scaleY = availHeight / imgH;
        let scale = Math.min(scaleX, scaleY);

        // Allow moderate upscaling (max 1.2x) to fill more space without cropping
        scale = Math.min(scale, 1.2);

        canvasScale = scale;

        canvas.width = imgW;
        canvas.height = imgH;

        canvas.style.width = (imgW * canvasScale) + 'px';
        canvas.style.height = (imgH * canvasScale) + 'px';

        canvas.style.display = 'block';
        dropZone.style.display = 'none';

        // Allow box to scale up to the longest side of the image
        maxSize = Math.max(imgW, imgH);
        if (editor.size > maxSize) editor.size = maxSize;
    }

    // ----- Reset everything (after save or when needed) -----
    function resetState() {
        originalImage = null;
        imageLoaded = false;
        darkOverlay = false;
        editor.visible = false;
        editor.x = 0;
        editor.y = 0;
        editor.size = 180;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.display = 'none';
        dropZone.style.display = 'block';

        // Reset buttons
        addButton.disabled = true;
        saveButton.disabled = true;
        addButton.textContent = 'Add Censorship';
    }

    // ----- Drawing -----
    function draw() {
        if (!imageLoaded) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

        if (darkOverlay) {
            ctx.fillStyle = 'rgba(0,0,0,0.35)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        if (editor.visible && censorImage.complete && censorImage.naturalWidth > 0) {
            ctx.drawImage(censorImage, editor.x, editor.y, editor.size, editor.size);
            drawSelection();
        }
    }

    function drawSelection() {
        ctx.save();
        ctx.strokeStyle = '#45ff45';
        ctx.lineWidth = 2;
        ctx.strokeRect(editor.x, editor.y, editor.size, editor.size);

        ctx.fillStyle = '#45ff45';
        const hx = editor.x + editor.size - HANDLE_SIZE / 2;
        const hy = editor.y + editor.size - HANDLE_SIZE / 2;
        ctx.fillRect(hx, hy, HANDLE_SIZE, HANDLE_SIZE);
        ctx.restore();
    }

    // ----- Coordinate conversion -----
    function canvasPoint(event) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY,
        };
    }

    // ----- Hit testing -----
    function insideEditor(x, y) {
        return x >= editor.x && x <= editor.x + editor.size &&
               y >= editor.y && y <= editor.y + editor.size;
    }

    function insideHandle(x, y) {
        const hx = editor.x + editor.size - HANDLE_SIZE / 2;
        const hy = editor.y + editor.size - HANDLE_SIZE / 2;
        return x >= hx && x <= hx + HANDLE_SIZE &&
               y >= hy && y <= hy + HANDLE_SIZE;
    }

    // ----- Drag / Resize state -----
    let dragging = false;
    let resizing = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    // ----- Canvas mouse events -----
    canvas.addEventListener('mousedown', function(e) {
        if (!isCensorTabActive() || !editor.visible) return;
        
        const p = canvasPoint(e);
        if (insideHandle(p.x, p.y)) {
            resizing = true;
            return;
        }
        if (insideEditor(p.x, p.y)) {
            dragging = true;
            dragOffsetX = p.x - editor.x;
            dragOffsetY = p.y - editor.y;
        }
    });

    window.addEventListener('mouseup', function() {
        dragging = false;
        resizing = false;
    });

    canvas.addEventListener('mousemove', function(e) {
        if (!isCensorTabActive() || !editor.visible) return;
        
        const p = canvasPoint(e);

        if (dragging) {
            editor.x = p.x - dragOffsetX;
            editor.y = p.y - dragOffsetY;
            clamp();
            draw();
            return;
        }
        
        // Limit the maximum square size based on its distance to the edges
        if (resizing) {
            const rawSize = Math.max(p.x - editor.x, p.y - editor.y);
            const maxSquareSize = Math.min(canvas.width - editor.x, canvas.height - editor.y);
            const newSize = Math.max(MIN_SIZE, Math.min(rawSize, maxSquareSize, maxSize));
            editor.size = newSize;

            clamp();
            draw();
            return;
        }

        if (insideHandle(p.x, p.y)) {
            canvas.style.cursor = 'nwse-resize';
        } else if (insideEditor(p.x, p.y)) {
            canvas.style.cursor = 'move';
        } else {
            canvas.style.cursor = 'default';
        }
    });

    // ----- Mouse wheel resize -----
    canvas.addEventListener('wheel', function(e) {
        if (!isCensorTabActive() || !editor.visible) return;
        
        const style = window.getComputedStyle(canvas);
        if (style.display === 'none') return;

        const p = canvasPoint(e);
        
        // Only hijack scroll if mouse is over the censor box
        if (!insideEditor(p.x, p.y) && !insideHandle(p.x, p.y)) {
            return; 
        }

        e.preventDefault();

        const delta = e.deltaY > 0 ? -1 : 1;
        const step = e.shiftKey ? 20 : 5;
        let rawSize = editor.size + delta * step;

        const maxSquareSize = Math.min(canvas.width - editor.x, canvas.height - editor.y);
        editor.size = Math.max(MIN_SIZE, Math.min(rawSize, maxSquareSize, maxSize));

        clamp();
        draw();
    }, { passive: false });

    // ----- Clamp editor inside canvas -----
    function clamp() {
        if (editor.x < 0) editor.x = 0;
        if (editor.y < 0) editor.y = 0;
        if (editor.x + editor.size > canvas.width) editor.x = canvas.width - editor.size;
        if (editor.y + editor.size > canvas.height) editor.y = canvas.height - editor.size;
    }

    // ----- Keyboard arrows -----
    window.addEventListener('keydown', function(e) {
        if (!isCensorTabActive() || !editor.visible) return;
        
        const step = e.shiftKey ? 10 : 1;
        switch (e.key) {
            case 'ArrowLeft':  editor.x -= step; break;
            case 'ArrowRight': editor.x += step; break;
            case 'ArrowUp':    editor.y -= step; break;
            case 'ArrowDown':  editor.y += step; break;
            default: return; // Let default scroll happen if not an arrow key
        }
        
        clamp();
        draw();
        e.preventDefault(); 
    });

    // ----- Drop zone -----
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropZone.classList.add('drag');
    });

    dropZone.addEventListener('dragleave', function() {
        dropZone.classList.remove('drag');
    });

    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        dropZone.classList.remove('drag');
        const file = e.dataTransfer.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Please drop a PNG or JPG image.');
            return;
        }

        originalFileName = file.name.replace(/\.[^.]+$/, '');

        const reader = new FileReader();
        reader.onload = function(ev) {
            const img = new Image();
            img.onload = function() {
                originalImage = img;
                imageLoaded = true;
                fitCanvas(img);

                editor.size = Math.min(img.width, img.height) / 4;
                editor.x = (img.width - editor.size) / 2;
                editor.y = (img.height - editor.size) / 2;

                // Automatically enable censorship
                editor.visible = true;
                darkOverlay = true;

                addButton.disabled = false;
                saveButton.disabled = false;
                addButton.textContent = 'Remove Censorship';
                draw();
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    });

    // ----- Add / Remove censorship -----
    addButton.addEventListener('click', function() {
        editor.visible = !editor.visible;
        darkOverlay = editor.visible;
        draw();
        addButton.textContent = editor.visible ? 'Remove Censorship' : 'Add Censorship';
    });

    // ----- Save as JPG and then reset -----
    saveButton.addEventListener('click', function() {
        if (!imageLoaded) return;

        const out = document.createElement('canvas');
        out.width = canvas.width;
        out.height = canvas.height;
        const octx = out.getContext('2d');

        octx.drawImage(originalImage, 0, 0, out.width, out.height);

        if (editor.visible && censorImage.complete && censorImage.naturalWidth > 0) {
            octx.drawImage(censorImage, editor.x, editor.y, editor.size, editor.size);
        }

        const link = document.createElement('a');
        link.download = originalFileName + '-Censored.jpg';
        link.href = out.toDataURL('image/jpeg', 0.7);
        link.click();

        // Clear everything so user can drag a new image
        resetState();
    });

    // ----- Handle window resize -----
    window.addEventListener('resize', function() {
        if (imageLoaded) {
            fitCanvas(originalImage);
            draw();
        }
    });

    // ----- Censor image load -----
    censorImage.onload = function() {
        if (imageLoaded) draw();
    };
    censorImage.onerror = function() {
        console.warn('Failed to load censorship image. Check URL.');
    };
})();
