const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    deadline: {
        type: Date,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    channel: {
        type: String,
        required: true,
    },
    active: {
        type: Boolean,
        default: true,
    },
});

module.exports = mongoose.model("Post", schema);
