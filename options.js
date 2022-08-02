const replace_regex = /(?<!%)%s/g;

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
        ok_indicator.style.display = 'none';
    });
    form.addEventListener('submit', (ev) => {
        ev.preventDefault();
        let result;
        try {
            result = JSON.parse(config.value);
        } catch {
            alert('Invalid config!');
            return;
        }
        for (let [k, v] of Object.entries(result)) {
            try {
                new URL(v);
            } catch {
                alert(`Not a valid url: "${k}": ${JSON.stringify(v)}`);
                return;
            }
            if (Array.from(v.matchAll(replace_regex)).length !== 1) {
                alert(`There should be exactly one %s in "${k}": "${v}"`);
                return;
            }
        }
        chrome.storage.sync.set({
            search_engines: result,
        }, function () {
            ok_indicator.style.display = 'inline';
        });
    });
}

main()
