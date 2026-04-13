// This is velutinx.github.io/assets/js/bluesky-composer.js

document.addEventListener('DOMContentLoaded', () => {
    const masterPost = document.getElementById('masterPost');
    const transformBtn = document.getElementById('transformBtn');
    const post1 = document.getElementById('post1'); // SFW
    const post2 = document.getElementById('post2'); // NSFW
    const dropzones = document.querySelectorAll('.dropzone');

    // ========== HELPER: convert concatenated words into hashtags ==========
    function textToHashtags(text) {
        const segments = [];
        let current = '';
        let lastType = null;
        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            const isSpace = /\s/.test(ch);
            const isLatin = /[a-zA-Z0-9]/.test(ch);
            let type = null;
            if (isSpace) type = 'space';
            else type = isLatin ? 'latin' : 'nonlatin';
            
            if (type === 'space') {
                current += ch;
                continue;
            }
            if (lastType === null) {
                current += ch;
                lastType = type;
            } else if (type === lastType) {
                current += ch;
            } else {
                if (current.trim()) segments.push(current.trim());
                current = ch;
                lastType = type;
            }
        }
        if (current.trim()) segments.push(current.trim());
        return segments.map(seg => `#${seg.replace(/\s+/g, '')}`).join(' ');
    }

    // ========== EVENT: Transform & Sync Master Post ==========
    if (transformBtn && masterPost) {
        transformBtn.addEventListener('click', () => {
            const text = masterPost.value.trim();
            if (!text) return;

            const lines = text.split('\n');
            let hashtags = '';
            
            // Extract the last line for hashtags
            if (lines.length > 0) {
                const rawHashtags = lines.pop(); 
                hashtags = textToHashtags(rawHashtags);
            }

            // Remove disclaimer (assuming it's the new last line if it exists, or just compile the rest)
            // This is a basic filter; adjust the condition to match your specific disclaimer text
            let contentLines = lines.filter(line => !line.toLowerCase().includes('disclaimer'));

            const finalContent = contentLines.join('\n').trim() + '\n\n' + hashtags;

            if (post1) post1.value = finalContent;
            if (post2) post2.value = finalContent;

            if (typeof showToast === 'function') {
                showToast('Transformed and synced to both accounts!', 'success');
            }
        });
    }

    // ========== EVENT: Image Drag & Drop Handlers ==========
    dropzones.forEach(dropzone => {
        const accountId = dropzone.dataset.account;
        const container = document.querySelector(`.thumbnail-container[data-account="${accountId}"]`);

        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.style.borderColor = '#5a6e3c';
            dropzone.style.background = '#131a24';
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.style.borderColor = '#3a4050';
            dropzone.style.background = '#0f131a';
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.style.borderColor = '#3a4050';
            dropzone.style.background = '#0f131a';

            const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
            handleImageUpload(files, container);
        });

        // Click to upload fallback
        dropzone.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.accept = 'image/*';
            input.onchange = (e) => {
                const files = Array.from(e.target.files);
                handleImageUpload(files, container);
            };
            input.click();
        });
    });

    function handleImageUpload(files, container) {
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const thumbItem = document.createElement('div');
                thumbItem.className = 'thumbnail-item';
                thumbItem.innerHTML = `
                    <img src="${e.target.result}" alt="thumbnail">
                    <button class="remove-btn">✖</button>
                `;
                
                thumbItem.querySelector('.remove-btn').addEventListener('click', () => thumbItem.remove());
                container.appendChild(thumbItem);
            };
            reader.readAsDataURL(file);
        });

        // Initialize SortableJS on the container if the library is loaded
        if (typeof Sortable !== 'undefined' && container) {
            new Sortable(container, {
                animation: 150,
                ghostClass: 'sortable-ghost'
            });
        }
    }
});
