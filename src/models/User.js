const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    identifier: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
    },
    points: {
        type: Number,
        default: 0,
        min: 0,
    },
});

module.exports = mongoose.model("User", schema);
