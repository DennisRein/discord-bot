const fetch = require('node-fetch');

module.exports = class BadDomainChecker { 



    constructor(client) {
        this.client = client; 

        this.BAD_HASHES_URL = "https://cdn.discordapp.com/bad-domains/hashes.json";
        this.BAD_LINKS_TXT_URL = "https://raw.githubusercontent.com/45i/Frequent-Scams/Main/Malicious%20Websites/raw-links.txt";
        this.BAD_PHRASES_URL = "https://raw.githubusercontent.com/AerGameChannel/AntiScam-Bot/master/filter.json";
        this.BAD_DOMAINS_URL = "https://bad-domains.walshy.dev/domains.json";

        this.BONUS_LIST = ["Free distribution of discord nitro", "https://discord.gg/"]
    }

    async init() {
        const links = await fetch(this.BAD_LINKS_TXT_URL);
        const phrases = await fetch(this.BAD_PHRASES_URL);
        const domains = await fetch(this.BAD_DOMAINS_URL);
        
        this.links = (await links.text()).split("\n");
        this.phrases = await phrases.json();
        this.domains = await domains.json();
    }

    stringHasURL(str) {
        var expression = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/i

        var regex = new RegExp(expression);
        if (regex.test(str)) {
            return regex.exec(str)[2];
        }

        return null;
    }

    isBadURL(str) {
        return this.links.includes(str) || this.domains.includes(str)
    }

    stringHasBadPhrase(str) {
        return this.phrases.some(v => str.includes(v)) || this.BONUS_LIST.some(v => str.includes(v))  || this.client.phrases.some(v => str.includes(v)) 
    }

}