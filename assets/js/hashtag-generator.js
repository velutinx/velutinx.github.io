// velutinx.github.io/assets/js/hashtag-generator.js
(function() {
    'use strict';

    // Override storage
    let overrideData = { franchise: {}, character: {} };

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

    // ----- Parser (unchanged) -----
    function parseInput(raw) {
        let text = raw.trim();

        text = text.replace(/\.(zip|rar|7z)$/i, '');
        text = text.replace(/^\[[^\]]+\]\s*/i, '');
        text = text.replace(/\([^)]*\)/g, '');
        text = text.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();

        if (text.startsWith("Preview:")) {
            const afterPreview = text.replace(/^Preview:\s*/i, '');
            const packIndex = afterPreview.indexOf(" — Pack");
            if (packIndex !== -1) {
                text = afterPreview.substring(0, packIndex).trim();
            } else {
                text = afterPreview;
            }
        }

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

    // ----- Generate hashtags (now uses overrides) -----
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

        // Apply overrides (case‑insensitive key matching)
        const lowerSeries = animeName.toLowerCase();
        const lowerCharacter = characterName.toLowerCase();

        if (overrideData.franchise[lowerSeries]) {
            const over = overrideData.franchise[lowerSeries];
            animeNative = over.native || animeNative;
            animeEnglish = over.english || animeEnglish;
        }
        if (overrideData.character[lowerCharacter]) {
            const over = overrideData.character[lowerCharacter];
            charNative = over.native || charNative;
        }

        // Build tag arrays in the required order:
        // English character tags (full name + reversed)
        // English series tag(s)
        // Japanese character tag
        // Japanese series tag

        const engCharTags = [];
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

        const engSeriesTags = [];
        const romajiTag = makeHashtag(animeRomaji);
        const englishTag = makeHashtag(animeEnglish);
        if (romajiTag && englishTag && romajiTag.toLowerCase() === englishTag.toLowerCase()) {
            engSeriesTags.push(englishTag);
        } else {
            if (romajiTag) engSeriesTags.push(romajiTag);
            if (englishTag) engSeriesTags.push(englishTag);
        }

        const jpCharTag = makeHashtag(charNative);
        const jpSeriesTag = makeHashtag(animeNative);

        const allTags = [
            ...engCharTags.filter(Boolean),
            ...engSeriesTags.filter(Boolean),
            jpCharTag,
            jpSeriesTag
        ].filter(Boolean);

        // Remove duplicates (case insensitive)
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

    // ----- Auto‑generation (debounced) -----
    let debounceTimer;

async function handleInput() {
    const input = document.getElementById('hashgenInput');
    const status = document.getElementById('hashgenStatus');
    const masterPost = document.getElementById('masterPost');

    if (!input || !masterPost) return;

    const raw = input.value.trim();
    if (!raw) {
        status.textContent = '';
        return;
    }

    const parsed = parseInput(raw);
    if (!parsed.character && !parsed.series) {
        status.textContent = 'Could not parse character or series';
        return;
    }

    status.textContent = 'Fetching AniList…';
    try {
        const hashtags = await generateHashtags(parsed.character, parsed.series);
        const hashtagString = hashtags.join(' ');

        // Detect if the input contains " — Request" (case‑insensitive)
        const isRequest = / — Request/i.test(raw);
        const openingLine = isRequest ? 'New request released.' : 'New work released.';

        const seriesDisplay = parsed.series || 'Unknown Series';
        const fullPost = `${openingLine}\n\n${parsed.character} from ${seriesDisplay}\n\nFull set on Patreon (link in bio)\n\n${hashtagString}`;

        masterPost.value = fullPost;
        masterPost.dispatchEvent(new Event('input'));

        status.textContent = '✅ Post ready!';
        if (typeof showToast === 'function') showToast('Post generated!', 'success');
    } catch (err) {
        console.error(err);
        status.textContent = '❌ AniList fetch failed';
    }
}

    function init() {
        // Load overrides first, then listen for input
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
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
