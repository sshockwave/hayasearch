class Suggestion {
    async fetch(url, term) {}
}

export class Google extends Suggestion {
    async fetch(url, _) {
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

export class Bilibili extends Suggestion {
    async fetch(url, term) {
        if (!url.match(/(?:^|\.)bilibili\./)) {
            return;
        }
        term = encodeURIComponent(term);
        url = `https://s.search.bilibili.com/main/suggest?func=suggest&main_ver=v1&term=${term}`;
        try {
            const res = await fetch(url);
            let data = await res.json();
            console.log(data);
            return data['result']['tag'].map(x=>x['value']);
        } catch {
            return;
        }
    }
}

const engine_list = [
    Google,
    Bilibili,
];

export default class Aggregated extends Suggestion {
    async fetch(url, term) {
        let ans = [];
        for (const eng of engine_list) {
            const api = new eng;
            const res = await api.fetch(url, term);
            if (res) {
                ans.push(res);
            }
        }
        return [].concat(...ans);
    }
}
