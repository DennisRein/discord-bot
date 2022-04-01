module.exports = function writePhrases(client) {
    var fs = require('fs');
    let path = "phrases.json";

    var json = JSON.stringify(client.phrases);

    fs.writeFileSync(path, json, { flag: 'w' },)
}

