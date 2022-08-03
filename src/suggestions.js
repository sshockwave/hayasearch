class Suggestion {
    async fetch(url) {}
}

export class Google extends Suggestion {
    async fetch(url) {
        if (!url.match(/(?:^|\.)google\./)) {
            return;
        }
        url = new URL(url);
        url.pathname = '/complete/search';
        url.searchParams.set('client', 'gws-wiz');
        try {
            const res = await fetch(url);
            let data = await res.text();
            data = data.replace(/^[\.a-z]+\(/m, '').replace(/\)$/m, '');
            data = JSON.parse(data);
            return data[0].map(x => x[0]);
        } catch {
            return;
        }
    }
}
