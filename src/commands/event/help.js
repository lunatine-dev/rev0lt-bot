const { SlashCommandBuilder, EmbedBuilder, time } = require("discord.js");
const moment = require("moment");

let help = [
    {
        title: "DD/MM",
        desc: `Omitting the year means it will use the current year`,
        input: "24/12",
    },
    {
        title: "DD/MM/YYYY",
        input: "24/12/2023",
    },
    {
        title: "DD/MM H(am|pm)",
        input: "24/12 7pm",
    },
    {
        title: "Hh",
        desc: "Hours from now",
        input: "12h",
    },
    {
        title: "Dd",
        desc: "Days from now",
        input: "4d",
    },
    {
        title: "Ww",
        desc: "Weeks from now",
        input: "2w",
    },
    {
        title: "Mm",
        desc: "Months from now",
        input: "2m",
    },
];

function parseDate(input) {
    // Check for specific patterns and parse accordingly
    if (/^\d{1,2}[-/]\d{1,2}$/.test(input)) {
        // DD-MM or DD/MM
        return moment(input, ["DD-MM", "DD/MM"]).toDate();
    } else if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(input)) {
        // DD-MM-YYYY or DD/MM/YYYY
        return moment(input, ["DD-MM-YYYY", "DD/MM/YYYY"]).toDate();
    } else if (/^\d{1,2}[-/]\d{1,2} \d{1,2}(am|pm)$/.test(input)) {
        // DD-MM H(am|pm) or DD/MM H(am|pm)
        return moment(input, ["DD-MM hA", "DD/MM hA"]).toDate();
    } else if (/^\d{1,2}h$/.test(input)) {
        // Hh
        return moment().add(parseInt(input), "hours").toDate();
    } else if (/^\d+d$/.test(input)) {
        // Dd
        return moment().add(parseInt(input), "days").toDate();
    } else if (/^\d+w$/.test(input)) {
        // Dw
        return moment().add(parseInt(input), "weeks").toDate();
    } else if (/^\d+m$/.test(input)) {
        // Dm
        return moment().add(parseInt(input), "months").toDate();
    } else {
        // Unable to parse
        return null;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Get help with dates"),
    hasField: {
        key: "role",
        value: "admin",
    },
    defer: {
        ephemeral: true,
    },
    async execute(interaction) {
        let i = 0;
        let fields = help.map((item) => {
            let output = parseDate(item.input);
            return {
                name: item.title,
                value: `${item.desc ? `${item.desc}\n` : ""}- Input: \`${
                    item.input
                }\`\n- Output: ${time(output)}`,
                inline: true,
            };
        });

        const embed = new EmbedBuilder().addFields(fields);

        await interaction.editReply({
            embeds: [embed],
            ephemeral: true,
        });
    },
};
