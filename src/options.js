const replace_regex = /(?<!%)%s/g;

async function get_icon(url) {
    const parser = new DOMParser;
    try {
        url = new URL(url);
    } catch {
        throw `Not a valid url: "${k}": ${JSON.stringify(v)}`;
    }
    if (Array.from(url.toString().matchAll(replace_regex)).length !== 1) {
        throw `There should be exactly one %s in "${k}": "${v}"`;
    }
    url.pathname = '';
    url.search = '';
    url.hash = '';
    let ans = null;
    try {
        const res = await fetch(url);
        const doc = parser.parseFromString(await res.text(), 'text/html');
        let best_size = 1e9;
        const ideal_size = 25;
        function get_href(el) {
            return (new URL(el.getAttribute('href'), url)).toString();
        }
        for(const el of doc.querySelectorAll('link[rel=icon]')) {
            if (el.sizes.length === 0 && ans === null) {
                ans = get_href(el);
            }
            for (const sz of el.sizes) {
                if (sz === 'any') {
                    ans = get_href(el);
                    best_size = ideal_size;
                } else {
                    let t = Number.parseInt(sz.split('x')[0]);
                    if (t < best_size && t >= ideal_size) {
                        ans = get_href(el);
                        best_size = t;
                    }
                }
            }
        }
    } catch {}
    if (ans === null) {
        url.pathname = 'favicon.ico';
        ans = url.toString();
    }
    return ans;
}

function main() {
    const form = document.getElementById('config-form');
    const config = document.getElementById('config-content');
    const ok_indicator = document.getElementById('ok-indicator');
    chrome.storage.sync.get(['search_engines'], ({ search_engines }) => {
        if (search_engines) {
            config.value = JSON.stringify(search_engines, null, 2);
        }
    });
    config.addEventListener('input', function () {
        ok_indicator.innerHTML = '';
    });
    form.addEventListener('submit', (ev) => {
        ev.preventDefault();
        ok_indicator.innerHTML = 'fetching icons';
        let result;
        try {
            result = JSON.parse(config.value);
        } catch {
            alert('Invalid config!');
            return;
        }
        async function run() {
            const icon_map = {};
            for (const [k, v] of Object.entries(result)) {
                ok_indicator.innerHTML = `Fetching icon for ${k}`;
                icon_map[v] = await get_icon(v);
            }
            ok_indicator.innerHTML = 'Saving data';
            await new Promise((res) => chrome.storage.sync.set({
                search_engines: result,
                icon_map,
            }, res));
            ok_indicator.innerHTML = 'OK';
        }
        run().catch((e) => {
            ok_indicator.innerHTML = 'Errored';
            alert(e);
        });
    });
}

main()
