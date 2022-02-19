module.exports = function writeConfig(client) {
    var fs = require('fs');
    let path = "./src/config.json";

    var json = JSON.stringify(client.config);
    console.log(json);
    console.log(client.config);
    fs.writeFileSync(path, json)
}

