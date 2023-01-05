const mongoose = require("mongoose");

const blogModel = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    read: String,
    links: {
        insta: "",
        fb: "",
        ln: "",
        tw: "",
    },
});
