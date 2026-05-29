// velutinx.github.io/assets/js/hashtag-generator.js
(function() {
    'use strict';

    // ----- Character/series overrides (exactly from your standalone version) -----
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
        // Remove file extensions
        text = text.replace(/\.(zip|rar|7z)$/i, '');
        // Remove leading [Pack XXX] or [Artist] etc.
        text = text.replace(/^\[[^\]]+\]\s*/i, '');
        // Remove parentheses content
        text = text.replace(/\([^)]*\)/g, '');
        // Normalise spaces
        text = text.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();

        const splitIndex = text.indexOf('-');
        if (splitIndex === -1) {
            return { character: text.trim(), series: '' };
        }
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
        const charQuery = `
            query ($search: String) {
                Character(search: $search) {
                    name { full, native }
                }
            }
        `;
        const animeQuery = `
            query ($search: String) {
                Media(search: $search, type: ANIME) {
                    title { romaji, english, native }
                }
            }
        `;

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

        // Overrides
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

        // Build tags
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

        // Remove duplicates and empty
        return [...new Set(tags.filter(Boolean))];
    }

    // ----- Initialisation (waits for Tweeter tab elements) -----
    function init() {
        const input = document.getElementById('hashgenInput');
        const btn = document.getElementById('hashgenBtn');
        const status = document.getElementById('hashgenStatus');
        const masterPost = document.getElementById('masterPost');

        if (!input || !btn || !masterPost) {
            // Elements missing – maybe the tab isn't visible yet; that's fine.
            return;
        }

        btn.addEventListener('click', async () => {
            const raw = input.value.trim();
            if (!raw) {
                if (typeof showToast === 'function') showToast('Paste a filename or Character - Series', 'error');
                return;
            }

            const parsed = parseInput(raw);
            if (!parsed.character && !parsed.series) {
                if (typeof showToast === 'function') showToast('Could not parse character or series', 'error');
                return;
            }

            btn.disabled = true;
            btn.textContent = 'Generating...';
            status.textContent = 'Fetching AniList…';

            try {
                const hashtags = await generateHashtags(parsed.character, parsed.series);
                const hashtagString = hashtags.join(' ');

                // Append to master post (add newline if there's already text)
                let current = masterPost.value.trimEnd();
                if (current) current += '\n';
                masterPost.value = current + hashtagString;

                // Trigger mirroring to other boxes
                masterPost.dispatchEvent(new Event('input'));

                if (typeof showToast === 'function') showToast('Hashtags generated!', 'success');
                status.textContent = '';
            } catch (err) {
                console.error(err);
                if (typeof showToast === 'function') showToast('AniList fetch failed', 'error');
                status.textContent = '❌ Failed to fetch AniList';
            } finally {
                btn.disabled = false;
                btn.textContent = 'Generate Hashtags';
            }
        });

        // Optional: allow Enter key in input to trigger generation
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                btn.click();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
