const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

const userModel = new mongoose.Schema({
    username: String,
    name: String,
    email: String,
    about: String,
    password: String,
    interests: [],
    lists: [],
    stories: [],
    avatar: {
        type: String,
        default: "dummy.png",
    },
});

userModel.plugin(plm, { usernameField: "email" });
const User = mongoose.model("user", userModel);
module.exports = User;
