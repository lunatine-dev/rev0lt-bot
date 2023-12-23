module.exports = (variables) => {
    var missing = [];

    for (const variable of variables) {
        if (!process.env[variable]) {
            missing.push(variables);
        }
    }

    if (missing.length) {
        console.log(
            `Missing envrionment variable${missing.length > 1 ? "s" : ""}`
        );

        process.exit(1);
    }
};
