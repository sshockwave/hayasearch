class Suggestion {
    async fetch(url, term) {}
}

export class Google extends Suggestion {
    async fetch(url, _) {
        url = new URL(url);
        if (!url.hostname.match(/(?:^|\.)google\./)) {
            return;
        }
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
        url = new URL(url);
        if (!url.hostname.match(/(?:^|\.)bilibili\./)) {
            return;
        }
        term = encodeURIComponent(term);
        url = `https://s.search.bilibili.com/main/suggest?func=suggest&main_ver=v1&term=${term}`;
        try {
            const res = await fetch(url);
            let data = await res.json();
            return data['result']['tag'].map(x=>x['value']);
        } catch {
            return;
        }
    }
}

export class Baidu extends Suggestion {
    async fetch(url, term) {
        url = new URL(url);
        if (!url.hostname.match(/(?:^|\.)baidu\./)) {
            return;
        }
        term = encodeURIComponent(term);
        url = `https://www.baidu.com/sugrec?prod=pc&wd=${term}`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            return data['g'].map(x=>x['q']);
        } catch {
            return;
        }
    }
}

const engine_list = [
    Google,
    Bilibili,
    Baidu,
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
