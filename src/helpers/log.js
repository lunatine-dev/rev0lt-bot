const chalk = require("chalk");

module.exports = (client) => {
    client.log = (message, color = "white") => {
        let time = new Date().toLocaleTimeString();
        let timeLog = chalk.gray(`[${time}]`);
        let messageLog = chalk[color](message);

        return console.log(`${timeLog} ${messageLog}`);
    };

    client.highlight = (text, color = "yellow") => {
        return chalk[color](text);
    };
};
