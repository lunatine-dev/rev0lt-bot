module.exports = (variables) => {
    var missing = [];

    for (const variable of variables) {
        if (!process.env[variable]) {
            missing.push(variable);
        }
    }

    if (missing.length) {
        console.log(
            `Missing ${missing.length} envrionment variable${
                missing.length > 1 ? "s" : ""
            } (${missing.join(", ")})`
        );

        process.exit(1);
    }
};
