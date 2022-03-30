module.exports = function writeConfig(client) {
    var fs = require('fs');
    let path = "./src/config.json";
    if(client.isproductive) {
        path = "config.json";
    }

    var json = JSON.stringify(client.config);
    fs.writeFileSync(path, json)
}

