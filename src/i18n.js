const i18next = require("i18next");
const Backend = require('i18next-fs-backend')

i18next.use(Backend).init({
    // initImmediate: false,
    lng: 'en',
    fallbackLng: 'en',
    preload: ['en', 'de'],
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
        loadPath: './i18n/{{lng}}/{{ns}}.json'
    }
}, (err, t) => {
    console.log(__dirname);
    if (err) return console.error(err)
})

module.exports = {
    i18next
}