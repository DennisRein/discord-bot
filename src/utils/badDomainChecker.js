const fetch = require('node-fetch');

class BadDomainChecker {
    constructor(client) {
        this.client = client;

        // Quellen
        this.BAD_LINKS_TXT_URL = "https://raw.githubusercontent.com/45i/Frequent-Scams/Main/Malicious%20Websites/raw-links.txt";
        this.BAD_PHRASES_URL = "https://raw.githubusercontent.com/AerGameChannel/AntiScam-Bot/master/filter.json";
        this.BAD_DOMAINS_URL = "https://bad-domains.walshy.dev/domains.json";

        // Extra
        this.BONUS_LIST = [
            "Free distribution of discord nitro",
            "https://discord.gg/"
        ];

        // Caches
        this.links = [];
        this.phrases = [];
        this.domains = [];
    }

    async init() {
        try {
            // Links (als Zeilenarray)
            const linksRes = await fetch(this.BAD_LINKS_TXT_URL);
            this.links = (await linksRes.text()).split("\n").filter(Boolean);

            // Phrasen
            const phrasesRes = await fetch(this.BAD_PHRASES_URL);
            this.phrases = await phrasesRes.json();

            // Domains
            const domainsRes = await fetch(this.BAD_DOMAINS_URL);
            this.domains = await domainsRes.json();
        } catch (err) {
            console.error("[BadDomainChecker] Fehler beim Laden der Blacklists:", err);
        }
    }

    stringHasURL(str) {
        // Findet die erste URL im String, gibt sie zurück (inklusive Subdomains)
        const urlRegex = /(?:https?:\/\/)?(?:www\.)?([\w\-_]+\.[\w\.\-_]+)(\/\S*)?/i;
        const match = urlRegex.exec(str);
        return match ? match[1].toLowerCase() : null;
    }

    isBadURL(url) {
        if (!url) return false;
        // Testet gegen bekannte böse URLs und Domains (nur Domainpart)
        url = url.toLowerCase().replace(/^www\./, "");
        return (
            this.links.some(link => url.includes(link.toLowerCase())) ||
            this.domains.some(domain => url === domain.toLowerCase() || url.endsWith("." + domain.toLowerCase()))
        );
    }

    stringHasBadPhrase(str) {
        if (!str) return false;
        str = str.toLowerCase();
        return (
            this.phrases.some(v => str.includes(v.toLowerCase())) ||
            this.BONUS_LIST.some(v => str.includes(v.toLowerCase())) ||
            (this.client.phrases?.some(v => str.includes(v.toLowerCase())) ?? false)
        );
    }
}

module.exports = BadDomainChecker;
