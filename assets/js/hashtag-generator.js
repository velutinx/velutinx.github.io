// velutinx.github.io/assets/js/hashtag-generator.js
(function() {
    'use strict';

    // ----- Character/series overrides -----
    const franchiseOverrides = {
        "genshin impact": { native: "原神", english: "GenshinImpact" },
        "wuthering waves": { native: "鸣潮", english: "WutheringWaves" },
        "rwby": { native: "RWBY", english: "RWBY" },
        "goddess of victory nikke": { native: "勝利の女神", english: "Nikke" }
    };
    const characterOverrides = {
        "diluc": { native: "ディルック" },
        "neopolitan": { native: "ネオポリタン" },
        "noir": { native: "ノワール" }
    };

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

    // ----- Improved parser: handles both "Character - Series" and "Preview: … — … — Pack #…" -----
    function parseInput(raw) {
        let text = raw.trim();

        // Remove common file extensions and brackets
        text = text.replace(/\.(zip|rar|7z)$/i, '');
        text = text.replace(/^\[[^\]]+\]\s*/i, '');
        text = text.replace(/\([^)]*\)/g, '');
        text = text.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();

        // 1) "Preview: … — Series — Pack #…" format
        if (text.startsWith("Preview:")) {
            const afterPreview = text.replace(/^Preview:\s*/i, '');
            // Take only the part before " — Pack #" (or " — Pack")
            const packIndex = afterPreview.indexOf(" — Pack");
            if (packIndex !== -1) {
                text = afterPreview.substring(0, packIndex).trim();
            } else {
                // If no " — Pack", just use everything after "Preview:"
                text = afterPreview;
            }
        }

        // 2) Split on either " — " (em dash with spaces) or " - " (hyphen with spaces)
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
        const series = text.slice(splitIndex + 3).trim();   // length of each separator is 3
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

    // ----- Generate hashtags and return them as an ordered array -----
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
        if (franchiseOverrides[lowerSeries]) {
            const over = franchiseOverrides[lowerSeries];
            animeNative = over.native || animeNative;
            animeEnglish = over.english || animeEnglish;
        }
        if (characterOverrides[lowerCharacter]) {
            const over = characterOverrides[lowerCharacter];
            charNative = over.native || charNative;
        }

        // ----- Build ordered tag lists -----
        const engCharTags = [];
        const splitChar = charFull.split(' ');
        if (splitChar.length >= 2) {
            // First the normal concatenation, then the reversed order
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

        // Combine in desired order: eng char, eng series, jp char, jp series
        const allTags = [
            ...engCharTags.filter(Boolean),
            ...engSeriesTags.filter(Boolean),
            jpCharTag,
            jpSeriesTag
        ].filter(Boolean);

        // Remove duplicates (keeping first occurrence)
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

    // ----- Auto‑generation on input (debounced) -----
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

            const seriesDisplay = parsed.series || 'Unknown Series';
            const fullPost = `New work released.\n\n${parsed.character} from ${seriesDisplay}\n\nFull set on Patreon (link in bio)\n\n${hashtagString}`;

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
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
