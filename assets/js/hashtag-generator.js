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

    async function generateHashtags(characterName, animeName) {
        const charQuery = `query ($search: String) { Character(search: $search) { name { full native } } }`;
        const animeQuery = `query ($search: String) { Media(search: $search, type: ANIME) { title { romaji english native } } }`;

        const [charData, animeData] = await Promise.all([
            fetchAniList(charQuery, { search: characterName }),
            fetchAniList(animeQuery, { search: animeName })
        ]);

        const character = charData?.data?.Character;
        const anime = animeData?.data?.Media;

        let charNative = character?.name?.native || '';
        let charFull = character?.name?.full || characterName;
        let animeNative = anime?.title?.native || '';
        let animeRomaji = anime?.title?.romaji || animeName;
        let animeEnglish = anime?.title?.english || '';

        animeRomaji = cleanupSeriesTitle(animeRomaji);
        animeEnglish = cleanupSeriesTitle(animeEnglish);

        const lowerSeries = animeName.toLowerCase();
        const lowerCharacter = characterName.toLowerCase();

        let franchiseOverride = overrideData.franchise[lowerSeries];
        let characterOverride = overrideData.character[lowerCharacter];

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

        const engCharTags = [];
        if (charEnglishOverride) {
            for (const eng of charEnglishOverride) {
                const tag = makeHashtag(eng);
                if (tag) engCharTags.push(tag);
            }
        } else {
            const splitChar = charFull.split(' ');
            if (splitChar.length >= 2) {
                const normal = splitChar.join('');
                const reversed = [...splitChar].reverse().join('');
                if (normal) engCharTags.push(makeHashtag(normal));
                if (reversed && reversed !== normal) engCharTags.push(makeHashtag(reversed));
            } else {
                const tag = makeHashtag(charFull);
                if (tag) engCharTags.push(tag);
            }
        }

        const engSeriesTags = [];
        if (Array.isArray(animeEnglish)) {
            for (const eng of animeEnglish) {
                const tag = makeHashtag(eng);
                if (tag) engSeriesTags.push(tag);
            }
        } else {
            const romajiTag = makeHashtag(animeRomaji);
            const englishTag = makeHashtag(animeEnglish);
            if (romajiTag && englishTag && romajiTag.toLowerCase() === englishTag.toLowerCase()) {
                engSeriesTags.push(englishTag);
            } else {
                if (romajiTag) engSeriesTags.push(romajiTag);
                if (englishTag) engSeriesTags.push(englishTag);
            }
        }

        const jpCharTags = [];
        if (Array.isArray(charNative)) {
            for (const nat of charNative) {
                const tag = makeHashtag(nat);
                if (tag) jpCharTags.push(tag);
            }
        } else {
            const tag = makeHashtag(charNative);
            if (tag) jpCharTags.push(tag);
        }

        const jpSeriesTags = [];
        if (Array.isArray(animeNative)) {
            for (const nat of animeNative) {
                const tag = makeHashtag(nat);
                if (tag) jpSeriesTags.push(tag);
            }
        } else {
            const tag = makeHashtag(animeNative);
            if (tag) jpSeriesTags.push(tag);
        }

        const allTags = [
            ...engCharTags.filter(Boolean),
            ...engSeriesTags.filter(Boolean),
            ...jpCharTags.filter(Boolean),
            ...jpSeriesTags.filter(Boolean)
        ];

        const seen = new Set();
        const uniqueTags = [];
        for (const tag of allTags) {
            const lower = tag.toLowerCase();
            if (!seen.has(lower)) {
                seen.add(lower);
                uniqueTags.push(tag);
            }
        }

        return uniqueTags;
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
            // ZIP drag → all off
            upcoming = false;
            request = false;
            sneak = false;
            // Reset the flag so it doesn't affect next manual input
            window._zipDragged = false;
        } else if (startsWithPreview) {
            // Preview text from manual paste or typing
            if (raw.includes(' — Request') || raw.includes(' Request ')) {
                upcoming = true;
                request = true;
                sneak = false;
            } else {
                // Contains " — Poll" or no special suffix → upcoming on, request off
                upcoming = true;
                request = false;
                sneak = false;
            }
        } else {
            // Any other manual input → all off (as per your correction)
            upcoming = false;
            request = false;
            sneak = false;
        }

        // ─── Apply to UI ────────────────────────────────────────────
        if (upcomingCheckbox) {
            upcomingCheckbox.checked = upcoming;
        }
        if (requestCheckbox) {
            requestCheckbox.checked = request;
        }
        if (sneakBtn) {
            const isOn = sneak;
            sneakBtn.classList.toggle('on', isOn);
            sneakBtn.textContent = isOn ? 'On' : 'Off';
            if (isOn) {
                masterPost.value = 'Sneak peak of the current work!\n\nStay tuned for the full release';
                masterPost.dispatchEvent(new Event('input'));
                status.textContent = 'Sneak peak mode';
                if (typeof showToast === 'function') showToast('Sneak peak enabled', 'info');
                return; // <-- Stop here; we've already set the master post
            } else {
                // If sneak was turned off, we still continue to generate the normal post
                // (But we might have been called from the sneak button itself – we handle that later)
            }
        }

        // ─── Parse and generate ──────────────────────────────────────
        const parsed = parseInput(raw);
        if (!parsed.character && !parsed.series) {
            status.textContent = 'Could not parse character or series';
            return;
        }

        status.textContent = 'Fetching AniList…';
        try {
            const hashtags = await generateHashtags(parsed.character, parsed.series);
            const hashtagString = hashtags.join(' ');

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
            status.textContent = '❌ AniList fetch failed';
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
                        // Re‑trigger the input handler to regenerate the normal post
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
