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
    res.render("index");
});

router.get("/home", isLoggedIn, function (req, res, next) {
    res.render("home");
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
                res.redirect("/home");
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
        successRedirect: "/home",
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

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/");
}

module.exports = router;
