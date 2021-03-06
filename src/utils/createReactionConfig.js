module.exports = function writeEntry(client, entry) {
    var fs = require('fs');
    let path = "./src/reaction-config.json";
    if(client.isproductive) {
        path = "reaction-config.json";
    }
    try {
        const { d } = require("../reaction-config.json");
        d.push(entry)
        fs.writeFileSync(path, JSON.stringify({"d": d}));
    } catch(exception) {            
        var json = JSON.stringify({'d': [entry]});
        fs.writeFileSync(path, json)
    }
    const { d } = require("../reaction-config.json");
    return d;
}

