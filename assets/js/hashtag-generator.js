// velutinx.github.io/assets/js/hashtag-generator.js
(function() {
    'use strict';

    // ----- Character/series overrides (same as standalone) -----
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

    function parseInput(raw) {
        let text = raw.trim();
        text = text.replace(/\.(zip|rar|7z)$/i, '');
        text = text.replace(/^\[[^\]]+\]\s*/i, '');
        text = text.replace(/\([^)]*\)/g, '');
        text = text.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();

        const splitIndex = text.indexOf('-');
        if (splitIndex === -1) return { character: text.trim(), series: '' };
        return {
            character: text.slice(0, splitIndex).trim(),
            series: text.slice(splitIndex + 1).trim()
        };
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
        if (franchiseOverrides[lowerSeries]) {
            const over = franchiseOverrides[lowerSeries];
            animeNative = over.native || animeNative;
            animeEnglish = over.english || animeEnglish;
        }
        if (characterOverrides[lowerCharacter]) {
            const over = characterOverrides[lowerCharacter];
            charNative = over.native || charNative;
        }

        const tags = [];
        tags.push(makeHashtag(charNative));
        const splitChar = charFull.split(' ');
        if (splitChar.length >= 2) {
            tags.push('#' + splitChar.join(''));
            tags.push('#' + [...splitChar].reverse().join(''));
        } else {
            tags.push(makeHashtag(charFull));
        }
        tags.push(makeHashtag(animeNative));
        const romajiTag = makeHashtag(animeRomaji);
        const englishTag = makeHashtag(animeEnglish);
        if (romajiTag && englishTag && romajiTag.toLowerCase() === englishTag.toLowerCase()) {
            tags.push(englishTag);
        } else {
            if (romajiTag) tags.push(romajiTag.toLowerCase());
            if (englishTag) tags.push(englishTag);
        }

        return [...new Set(tags.filter(Boolean))];
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

            let current = masterPost.value.trimEnd();
            if (current) current += '\n';
            masterPost.value = current + hashtagString;

            // Trigger mirroring
            masterPost.dispatchEvent(new Event('input'));

            status.textContent = '✅ Hashtags added!';
            if (typeof showToast === 'function') showToast('Hashtags generated!', 'success');
        } catch (err) {
            console.error(err);
            status.textContent = '❌ AniList fetch failed';
        }
    }

    function init() {
        const input = document.getElementById('hashgenInput');
        if (!input) return;

        // Debounced input listener
        input.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(handleInput, 800);   // 0.8s after last keystroke/paste
        });

        // Also immediately trigger on paste for faster response
        input.addEventListener('paste', () => {
            // After paste, the input event will fire anyway, but we can shorten the debounce
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(handleInput, 300);   // faster after paste
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
