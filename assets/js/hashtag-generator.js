// velutinx.github.io/assets/js/hashtag-generator.js
(function() {
    'use strict';

    let overrideData = { franchise: {}, character: {} };
    let packsCache = null;

    async function loadOverrides() {
        try {
            const res = await fetch('/assets/js/utils/overrides.json');
            if (res.ok) {
                const json = await res.json();
                overrideData = {
                    franchise: json.franchise || {},
                    character: json.character || {}
                };
            } else {
                console.warn('Overrides file not found, using AniList only.');
            }
        } catch (err) {
            console.warn('Failed to load overrides, using AniList only.', err);
        }
    }

    async function fetchAllPacks() {
        if (packsCache) return packsCache;
        try {
            const response = await fetch('https://packs-api.velutinx.workers.dev/api/packs');
            if (!response.ok) throw new Error(`API error: ${response.status}`);
            const data = await response.json();
            packsCache = data;
            return data;
        } catch (err) {
            console.warn('Failed to fetch packs from API:', err);
            return [];
        }
    }

    function extractPackNumber(text) {
        const match = text.match(/(?:Pack\s*)?#(\d+)/i);
        return match ? match[1] : null;
    }

    async function getPackPageCount(packNumber) {
        if (!packNumber) return null;

        if (window._zipPageCount && window._zipPackNumber === packNumber) {
            console.log(`✅ Using ZIP-provided page count: ${window._zipPageCount}`);
            return window._zipPageCount;
        }

        const packs = await fetchAllPacks();
        const pack = packs.find(p => String(p.id) === String(packNumber));
        return pack ? pack.illustrationCount : null;
    }

    function cleanTag(str) {
        if (!str) return '';
        return str.normalize("NFKC")
            .replace(/[\s\-_]+/g, '')
            .replace(/[^\w\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/g, '')
            .trim();
    }

    function makeHashtag(str) {
        if (!str) return null;
        const cleaned = cleanTag(str);
        return cleaned ? '#' + cleaned : null;
    }

    function cleanupSeriesTitle(title) {
        if (!title) return '';
        return title.replace(/:.*/, '').trim();
    }

    function parseInput(raw) {
        let text = raw.trim();

        text = text.replace(/\.(zip|rar|7z)$/i, '');
        text = text.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();

        if (/^\[[^\]]+\]/.test(text)) {
            const bracketMatch = text.match(/^\[([^\]]+)\]\s*(.+)/);
            if (bracketMatch) {
                const bracketContent = bracketMatch[1].trim();
                let rest = bracketMatch[2].trim();

                if (/^Pack \d+$/i.test(bracketContent)) {
                    text = rest;
                } else {
                    const sepIndex = rest.search(/ — | - /);
                    if (sepIndex !== -1) {
                        rest = rest.substring(0, sepIndex).trim();
                    }
                    return { character: rest, series: bracketContent };
                }
            }
        }

        if (text.startsWith("Preview:")) {
            const afterPreview = text.replace(/^Preview:\s*/i, '');
            const packIndex = afterPreview.indexOf(" — Pack");
            if (packIndex !== -1) {
                text = afterPreview.substring(0, packIndex).trim();
            } else {
                text = afterPreview;
            }
        }

        text = text.replace(/\([^)]*\)/g, '').trim();

        const separators = [' — ', ' - '];
        let splitIndex = -1;
        for (const sep of separators) {
            const idx = text.indexOf(sep);
            if (idx !== -1) {
                splitIndex = idx;
                break;
            }
        }

        if (splitIndex === -1) {
            return { character: text.trim(), series: '' };
        }

        const character = text.slice(0, splitIndex).trim();
        const series = text.slice(splitIndex + 3).trim();
        return { character, series };
    }

    async function fetchAniList(query, variables) {
        const response = await fetch("https://graphql.anilist.co", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({ query, variables })
        });
        return response.json();
    }

    // Get character tags (English + Japanese) for a single character
    async function getCharacterTags(characterName, seriesName) {
        const charQuery = `query ($search: String) { Character(search: $search) { name { full native } } }`;
        const charData = await fetchAniList(charQuery, { search: characterName });
        const character = charData?.data?.Character;

        let charNative = character?.name?.native || '';
        let charFull = character?.name?.full || characterName;

        const lowerCharacter = characterName.toLowerCase();
        const characterOverride = overrideData.character[lowerCharacter];

        let charEnglishOverride = null;
        if (characterOverride) {
            if (characterOverride.native) {
                charNative = Array.isArray(characterOverride.native)
                    ? characterOverride.native
                    : [characterOverride.native];
            }
            if (characterOverride.english) {
                charEnglishOverride = Array.isArray(characterOverride.english)
                    ? characterOverride.english
                    : [characterOverride.english];
            }
        }

        const engTags = [];
        if (charEnglishOverride) {
            for (const eng of charEnglishOverride) {
                const tag = makeHashtag(eng);
                if (tag) engTags.push(tag);
            }
        } else {
            const splitChar = charFull.split(' ');
            if (splitChar.length >= 2) {
                const normal = splitChar.join('');
                const reversed = [...splitChar].reverse().join('');
                if (normal) engTags.push(makeHashtag(normal));
                if (reversed && reversed !== normal) engTags.push(makeHashtag(reversed));
            } else {
                const tag = makeHashtag(charFull);
                if (tag) engTags.push(tag);
            }
        }

        const jpTags = [];
        if (Array.isArray(charNative)) {
            for (const nat of charNative) {
                const tag = makeHashtag(nat);
                if (tag) jpTags.push(tag);
            }
        } else {
            const tag = makeHashtag(charNative);
            if (tag) jpTags.push(tag);
        }

        return [...engTags.filter(Boolean), ...jpTags.filter(Boolean)];
    }

    // Get series tags (English + Japanese) for a given series name
    async function getSeriesTags(seriesName) {
        const animeQuery = `query ($search: String) { Media(search: $search, type: ANIME) { title { romaji english native } } }`;
        const animeData = await fetchAniList(animeQuery, { search: seriesName });
        const anime = animeData?.data?.Media;

        let animeNative = anime?.title?.native || '';
        let animeRomaji = anime?.title?.romaji || seriesName;
        let animeEnglish = anime?.title?.english || '';

        animeRomaji = cleanupSeriesTitle(animeRomaji);
        animeEnglish = cleanupSeriesTitle(animeEnglish);

        const lowerSeries = seriesName.toLowerCase();
        const franchiseOverride = overrideData.franchise[lowerSeries];

        if (franchiseOverride) {
            if (franchiseOverride.native) {
                animeNative = Array.isArray(franchiseOverride.native)
                    ? franchiseOverride.native
                    : [franchiseOverride.native];
            }
            if (franchiseOverride.english) {
                animeEnglish = Array.isArray(franchiseOverride.english)
                    ? franchiseOverride.english
                    : [franchiseOverride.english];
            }
        }

        const engTags = [];
        if (Array.isArray(animeEnglish)) {
            for (const eng of animeEnglish) {
                const tag = makeHashtag(eng);
                if (tag) engTags.push(tag);
            }
        } else {
            const romajiTag = makeHashtag(animeRomaji);
            const englishTag = makeHashtag(animeEnglish);
            if (romajiTag && englishTag && romajiTag.toLowerCase() === englishTag.toLowerCase()) {
                engTags.push(englishTag);
            } else {
                if (romajiTag) engTags.push(romajiTag);
                if (englishTag) engTags.push(englishTag);
            }
        }

        const jpTags = [];
        if (Array.isArray(animeNative)) {
            for (const nat of animeNative) {
                const tag = makeHashtag(nat);
                if (tag) jpTags.push(tag);
            }
        } else {
            const tag = makeHashtag(animeNative);
            if (tag) jpTags.push(tag);
        }

        return [...engTags.filter(Boolean), ...jpTags.filter(Boolean)];
    }

    let debounceTimer;

    async function handleInput() {
        const input = document.getElementById('hashgenInput');
        const status = document.getElementById('hashgenStatus');
        const masterPost = document.getElementById('masterPost');
        const upcomingCheckbox = document.getElementById('upcomingCheckbox');
        const requestCheckbox = document.getElementById('requestCheckbox');
        const sneakBtn = document.getElementById('sneakPeakBtn');

        if (!input || !masterPost) return;

        const raw = input.value.trim();
        if (!raw) {
            status.textContent = '';
            return;
        }

        // ─── AUTOMATIC TOGGLE LOGIC ────────────────────────────────
        let upcoming = false;
        let request = false;
        let sneak = false;

        const isZipDrag = window._zipDragged === true;
        const startsWithPreview = raw.startsWith('Preview:');

        if (isZipDrag) {
            upcoming = false;
            request = false;
            sneak = false;
            window._zipDragged = false;
        } else if (startsWithPreview) {
            if (raw.includes(' — Request') || raw.includes(' Request ')) {
                upcoming = true;
                request = true;
                sneak = false;
            } else {
                upcoming = true;
                request = false;
                sneak = false;
            }
        } else {
            upcoming = false;
            request = false;
            sneak = false;
        }

        if (upcomingCheckbox) upcomingCheckbox.checked = upcoming;
        if (requestCheckbox) requestCheckbox.checked = request;
        if (sneakBtn) {
            const isOn = sneak;
            sneakBtn.classList.toggle('on', isOn);
            sneakBtn.textContent = isOn ? 'On' : 'Off';
            if (isOn) {
                masterPost.value = 'Sneak peak of the current work!\n\nStay tuned for the full release';
                masterPost.dispatchEvent(new Event('input'));
                status.textContent = 'Sneak peak mode';
                if (typeof showToast === 'function') showToast('Sneak peak enabled', 'info');
                return;
            }
        }

        // ─── Parse input ─────────────────────────────────────────────
        const parsed = parseInput(raw);
        if (!parsed.character && !parsed.series) {
            status.textContent = 'Could not parse character or series';
            return;
        }

        status.textContent = 'Fetching data…';

        try {
            const packNumber = extractPackNumber(raw);
            let pageCount = null;
            if (packNumber) {
                pageCount = await getPackPageCount(packNumber);
                if (pageCount !== null) {
                    status.textContent = `✅ Pack #${packNumber}: ${pageCount} images`;
                } else {
                    status.textContent = `⚠️ Pack #${packNumber} not found in DB or ZIP`;
                }
            }

            // ─── Get series tags (once) ──────────────────────────────
            const seriesTags = await getSeriesTags(parsed.series);

            // ─── Get character tags ───────────────────────────────────
            let characterTags = [];
            const characterName = parsed.character;

            // Check for ' & ' (multiple characters)
            if (characterName.includes(' & ')) {
                const parts = characterName.split(' & ').map(s => s.trim());
                for (const part of parts) {
                    const tags = await getCharacterTags(part, parsed.series);
                    characterTags = characterTags.concat(tags);
                }
            } else {
                characterTags = await getCharacterTags(characterName, parsed.series);
            }

            // Combine and deduplicate
            const allTags = [...characterTags, ...seriesTags];
            const seen = new Set();
            const uniqueTags = [];
            for (const tag of allTags) {
                const lower = tag.toLowerCase();
                if (!seen.has(lower)) {
                    seen.add(lower);
                    uniqueTags.push(tag);
                }
            }
            const hashtagString = uniqueTags.join(' ');

            // ─── Build opening line ──────────────────────────────────
            let openingLine;
            if (request) {
                openingLine = upcoming ? 'Upcoming new request.' : 'New request released.';
            } else {
                openingLine = upcoming ? 'Upcoming new work.' : 'New work released.';
            }

            const seriesDisplay = parsed.series || 'Unknown Series';
            const characterDisplay = parsed.character;
            const pageSuffix = (pageCount !== null && pageCount > 0) ? ` (${pageCount}p)` : '';

            const fullPost = `${openingLine}\n\n${characterDisplay} from ${seriesDisplay}${pageSuffix}\n\nFull set on Patreon (link in bio)\n\n${hashtagString}`;

            masterPost.value = fullPost;
            masterPost.dispatchEvent(new Event('input'));

            if (status.textContent && !status.textContent.startsWith('✅')) {
                status.textContent = '✅ Post ready!';
            }
            if (typeof showToast === 'function') showToast('Post generated!', 'success');
        } catch (err) {
            console.error(err);
            status.textContent = '❌ Data fetch failed';
        }
    }

    function init() {
        loadOverrides().then(() => {
            const input = document.getElementById('hashgenInput');
            if (!input) return;

            input.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(handleInput, 800);
            });

            input.addEventListener('paste', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(handleInput, 300);
            });

            const upcomingCheckbox = document.getElementById('upcomingCheckbox');
            if (upcomingCheckbox) {
                upcomingCheckbox.addEventListener('change', handleInput);
            }

            const requestCheckbox = document.getElementById('requestCheckbox');
            if (requestCheckbox) {
                requestCheckbox.addEventListener('change', handleInput);
            }

            const sneakBtn = document.getElementById('sneakPeakBtn');
            if (sneakBtn) {
                sneakBtn.addEventListener('click', function() {
                    const isOn = this.classList.toggle('on');
                    this.textContent = isOn ? 'On' : 'Off';
                    const master = document.getElementById('masterPost');
                    if (isOn) {
                        master.value = 'Sneak peak of the current work!\n\nStay tuned for the full release';
                        master.dispatchEvent(new Event('input'));
                        if (typeof showToast === 'function') showToast('Sneak peak enabled', 'info');
                    } else {
                        const inputEvent = new Event('input', { bubbles: true });
                        document.getElementById('hashgenInput').dispatchEvent(inputEvent);
                    }
                });
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
