var express = require("express");
var router = express.Router();

const fs = require("fs");
const path = require("path");
const upload = require("./multer");

const User = require("../models/userModel");
const passport = require("passport");
const LocalStrategy = require("passport-local");

passport.use(User.createStrategy());

router.get("/", function (req, res, next) {
    res.render("index", { isLoggedIn: req.user ? true : false });
});

router.get("/signup", function (req, res, next) {
    res.render("signup");
});

router.post("/signup", function (req, res, next) {
    const { name, username, email, password } = req.body;

    const CreateUser = new User({ name, username, email });

    User.register(CreateUser, password)
        .then(() => {
            const authenticate = User.authenticate();
            authenticate(email, password, function (err, result) {
                if (err) res.send(err);
                res.redirect("/");
            });
        })
        .catch((err) => res.send(err));
});

router.get("/signin", function (req, res, next) {
    res.render("signin");
});

router.post(
    "/signin",
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/",
    }),
    function (req, res, next) {}
);

router.get("/signout", function (req, res, next) {
    req.logout(function () {
        res.redirect("/");
    });
});

router.get("/profile", isLoggedIn, function (req, res, next) {
    res.render("profile", { user: req.user });
});

router.post("/profile", upload.single("avatar"), function (req, res, next) {
    const updatedUser = {
        about: req.body.about,
    };
    if (req.file) {
        if (req.body.oldavatar !== "dummy.png") {
            fs.unlinkSync(
                path.join(
                    __dirname,
                    "..",
                    "public",
                    "uploads",
                    req.body.oldavatar
                )
            );
        }

        updatedUser.avatar = req.file.filename;
    }

    User.findByIdAndUpdate(req.user._id, updatedUser)
        .then(() => {
            res.redirect("/profile");
        })
        .catch((err) => res.send(err));
});

router.get("/settings", isLoggedIn, function (req, res, next) {
    res.render("settings", { user: req.user });
});

router.post("/settings", function (req, res, next) {
    User.findByIdAndUpdate(req.user._id, req.body)
        .then(() => {
            res.redirect("/settings");
        })
        .catch((err) => res.send(err));
});

router.get("/delete", isLoggedIn, function (req, res, next) {
    User.findByIdAndDelete(req.user._id)
        .then(() => {
            res.redirect("/signout");
        })
        .catch((err) => res.send(err));
});

// ---------------------------------------------------
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/");
}

module.exports = router;
