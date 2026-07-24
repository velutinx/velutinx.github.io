// assets/js/censor.js
(function() {
    'use strict';
    const canvas = document.getElementById('censorCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dropZone = document.getElementById('censor-dropZone');
    const addButton = document.getElementById('censor-addBtn');
    const saveButton = document.getElementById('censor-saveBtn');
    const canvasWrapper = document.getElementById('censor-canvasWrapper');
    const censorImage = new Image();
    censorImage.crossOrigin = 'anonymous';
    censorImage.src = 'https://www.velutinx.com/images/Censoring.png';
    let originalImage = null;
    let originalFileName = 'image';
    let imageLoaded = false;
    let editors = [];
    let selectedIndex = -1;
    const HANDLE_SIZE = 16;
    const MIN_SIZE = 32;
    function isCensorTabActive() {
        const censorTab = document.getElementById('censor');
        return censorTab ? censorTab.classList.contains('active') : false;
    }
    function fitCanvas(img) {
        const wrapperRect = canvasWrapper.getBoundingClientRect();
        const availWidth = wrapperRect.width - 12;
        const availHeight = wrapperRect.height - 12;
        const scale = Math.min(availWidth / img.width, availHeight / img.height, 1.2);
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.style.width = (img.width * scale) + 'px';
        canvas.style.height = (img.height * scale) + 'px';
        canvas.style.display = 'block';
        dropZone.style.display = 'none';
    }
    function resetState() {
        originalImage = null;
        imageLoaded = false;
        editors = [];
        selectedIndex = -1;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.display = 'none';
        dropZone.style.display = 'block';
        addButton.disabled = true;
        saveButton.disabled = true;
    }
    function draw() {
        if (!imageLoaded) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
        for (let i = 0; i < editors.length; i++) {
            const e = editors[i];
            if (!e.visible) continue;
            if (censorImage.complete && censorImage.naturalWidth > 0) {
                ctx.drawImage(censorImage, e.x, e.y, e.size, e.size);
            }
        }
        if (selectedIndex >= 0 && selectedIndex < editors.length) {
            const e = editors[selectedIndex];
            if (e.visible) {
                ctx.save();
                ctx.strokeStyle = '#45ff45';
                ctx.lineWidth = 2;
                ctx.strokeRect(e.x, e.y, e.size, e.size);
                ctx.fillStyle = '#45ff45';
                const hx = e.x + e.size - HANDLE_SIZE / 2;
                const hy = e.y + e.size - HANDLE_SIZE / 2;
                ctx.fillRect(hx, hy, HANDLE_SIZE, HANDLE_SIZE);
                ctx.restore();
            }
        }
    }
    function canvasPoint(event) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) * (canvas.width / rect.width),
            y: (event.clientY - rect.top) * (canvas.height / rect.height),
        };
    }
    function hitTest(x, y) {
        for (let i = editors.length - 1; i >= 0; i--) {
            const e = editors[i];
            if (!e.visible) continue;
            if (x >= e.x && x <= e.x + e.size && y >= e.y && y <= e.y + e.size) {
                return i;
            }
        }
        return -1;
    }
    function insideHandle(e, x, y) {
        const hx = e.x + e.size - HANDLE_SIZE / 2;
        const hy = e.y + e.size - HANDLE_SIZE / 2;
        return x >= hx && x <= hx + HANDLE_SIZE && y >= hy && y <= hy + HANDLE_SIZE;
    }
    let dragging = false;
    let resizing = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let activeEditor = null;
    canvas.addEventListener('mousedown', function(e) {
        if (!isCensorTabActive() || editors.length === 0) return;
        const p = canvasPoint(e);
        const idx = hitTest(p.x, p.y);
        if (idx >= 0) {
            selectedIndex = idx;
            const ed = editors[idx];
            if (insideHandle(ed, p.x, p.y)) {
                resizing = true;
                activeEditor = ed;
                return;
            }
            dragging = true;
            activeEditor = ed;
            dragOffsetX = p.x - ed.x;
            dragOffsetY = p.y - ed.y;
        } else {
            selectedIndex = -1;
        }
        draw();
    });
    window.addEventListener('mouseup', function() {
        dragging = false;
        resizing = false;
        activeEditor = null;
    });
    canvas.addEventListener('mousemove', function(e) {
        if (!isCensorTabActive() || (!dragging && !resizing)) return;
        const p = canvasPoint(e);
        if (!activeEditor) return;
        if (dragging) {
            activeEditor.x = p.x - dragOffsetX;
            activeEditor.y = p.y - dragOffsetY;
            draw();
            return;
        }
        if (resizing) {
            const rawSize = Math.max(p.x - activeEditor.x, p.y - activeEditor.y);
            activeEditor.size = Math.max(MIN_SIZE, rawSize);
            draw();
            return;
        }
    });
    canvas.addEventListener('mousemove', function(e) {
        if (!isCensorTabActive() || editors.length === 0) return;

        const p = canvasPoint(e);
        const idx = hitTest(p.x, p.y);
        if (idx >= 0) {
            const ed = editors[idx];
            if (insideHandle(ed, p.x, p.y)) {
                canvas.style.cursor = 'nwse-resize';
                return;
            }
            canvas.style.cursor = 'move';
            return;
        }
        canvas.style.cursor = 'default';
    });
    canvas.addEventListener('wheel', function(e) {
        if (!isCensorTabActive() || editors.length === 0) return;
        const p = canvasPoint(e);
        const idx = hitTest(p.x, p.y);
        if (idx < 0) return;
        e.preventDefault();
        const ed = editors[idx];
        const delta = e.deltaY > 0 ? -1 : 1;
        const step = e.shiftKey ? 20 : 5;
        ed.size = Math.max(MIN_SIZE, ed.size + delta * step);
        draw();
    }, { passive: false });
    window.addEventListener('keydown', function(e) {
        if (!isCensorTabActive()) return;
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIndex >= 0 && editors.length > 0) {
            e.preventDefault();
            editors.splice(selectedIndex, 1);
            selectedIndex = Math.min(selectedIndex, editors.length - 1);
            draw();
            return;
        }
        if (selectedIndex >= 0 && editors[selectedIndex] && editors[selectedIndex].visible) {
            const step = e.shiftKey ? 10 : 1;
            const ed = editors[selectedIndex];
            switch (e.key) {
                case 'ArrowLeft':  ed.x -= step; break;
                case 'ArrowRight': ed.x += step; break;
                case 'ArrowUp':    ed.y -= step; break;
                case 'ArrowDown':  ed.y += step; break;
                default: return;
            }
            e.preventDefault();
            draw();
        }
    });

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
                editors = [];
                selectedIndex = -1;
                const defaultSize = Math.min(img.width, img.height) / 4;
                editors.push({
                    x: (img.width - defaultSize) / 2,
                    y: (img.height - defaultSize) / 2,
                    size: defaultSize,
                    visible: true
                });
                selectedIndex = 0;
                addButton.disabled = false;
                saveButton.disabled = false;
                draw();
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    });
    addButton.addEventListener('click', function() {
        if (!imageLoaded) return;
        const baseSize = Math.min(originalImage.width, originalImage.height) / 4;
        const offset = 30 * (editors.length % 5);
        const newBox = {
            x: (originalImage.width - baseSize) / 2 + offset,
            y: (originalImage.height - baseSize) / 2 + offset,
            size: baseSize,
            visible: true
        };
        editors.push(newBox);
        selectedIndex = editors.length - 1;
        draw();
    });
    saveButton.addEventListener('click', function() {
        if (!imageLoaded) return;
        const out = document.createElement('canvas');
        out.width = canvas.width;
        out.height = canvas.height;
        const octx = out.getContext('2d');
        octx.drawImage(originalImage, 0, 0, out.width, out.height);
        for (const e of editors) {
            if (e.visible && censorImage.complete && censorImage.naturalWidth > 0) {
                octx.drawImage(censorImage, e.x, e.y, e.size, e.size);
            }
        }
        const link = document.createElement('a');
        link.download = originalFileName + '-Censored.jpg';
        link.href = out.toDataURL('image/jpeg', 0.7);
        link.click();

        resetState();
    });
    window.addEventListener('resize', function() {
        if (imageLoaded) {
            fitCanvas(originalImage);
            draw();
        }
    });
    censorImage.onload = function() {
        if (imageLoaded) draw();
    };
    censorImage.onerror = function() {
        console.warn('Failed to load censorship image. Check URL.');
    };
})();
