const moment = require("moment");

module.exports = (client) => {
    client.parseDate = (input) => {
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
        } else if (/^\d+s$/.test(input)) {
            // Ss (seconds)
            return moment().add(parseInt(input), "seconds").toDate();
        } else {
            // Unable to parse
            return null;
        }
    };
};
