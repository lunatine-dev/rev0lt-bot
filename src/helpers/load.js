const path = require("path"),
    fs = require("fs");

module.exports = (client) => {
    const moduleDirectory = path.join(__dirname, "..", "modules");
    const commandsDirectory = path.join(__dirname, "..", "commands");
    const eventsDirectory = path.join(__dirname, "..", "events");

    for (const file of fs.readdirSync(moduleDirectory)) {
        const module = require(path.join(moduleDirectory, file))(client);
    }
    for (const event of fs
        .readdirSync(eventsDirectory)
        .filter((file) => file.endsWith(".js"))) {
        const name = event.split(".")[0];
        const handler = require(path.join(eventsDirectory, event));
        client.on(name, handler.bind(null, client));
    }
    for (const category of fs.readdirSync(commandsDirectory)) {
        for (const file of fs.readdirSync(
            path.join(commandsDirectory, category)
        )) {
            const command = require(path.join(
                commandsDirectory,
                category,
                file
            ));
            command.category = category;
            client.commands.set(command.data.name, command);
        }
    }
};
