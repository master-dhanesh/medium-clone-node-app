var express = require("express");
var router = express.Router();

const nodemailer = require("nodemailer");

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

router.get("/reset-password", isLoggedIn, function (req, res, next) {
    res.render("reset", { user: req.user });
});

router.post("/reset-password", isLoggedIn, function (req, res, next) {
    req.user.changePassword(
        req.body.oldpassword,
        req.body.newpassword,
        function (err) {
            if (err) return res.send(err);
            res.redirect("/signout");
        }
    );
});

router.get("/forget-password", function (req, res, next) {
    res.render("forget");
});
router.post("/forget-password", function (req, res, next) {
    User.findOne({ email: req.body.email })
        .then((user) => {
            if (!user)
                return res.send(
                    "Not found <a href='/forget-password'>Try Harder!</a>"
                );

            // next page url
            const pageurl =
                req.protocol +
                "://" +
                req.get("host") +
                "/change-password/" +
                user._id;

            // send email to the email with gmail
            const transport = nodemailer.createTransport({
                service: "gmail",
                host: "smtp.gmail.com",
                port: 465,
                auth: {
                    user: "dhanesh1296@gmail.com",
                    pass: "sdoskatodgmrlfky",
                },
            });

            const mailOptions = {
                from: "Dhanesh Pvt. Ltd.<dhanesh1296@gmail.com>",
                to: req.body.email,
                subject: "Password Reset Link",
                text: "Do not share this link to anyone.",
                html: `<a href=${pageurl}>Password Reset Link</a>`,
            };

            transport.sendMail(mailOptions, (err, info) => {
                if (err) return res.send(err);
                console.log(info);
                user.resetPasswordToken = 1;
                user.save();
                return res.send(
                    "<h1 style='text-align:center;color: tomato; margin-top:10%'><span style='font-size:60px;'>✔️</span> <br />Email Sent! Check your inbox , <br/>check spam in case not found in inbox.</h1>"
                );
            });
            // ------------------------------
        })
        .catch((err) => {
            res.send(err);
        });
});

router.get("/change-password/:id", function (req, res, next) {
    res.render("changepassword", { id: req.params.id });
});

router.post("/change-password/:id", function (req, res) {
    User.findById(req.params.id)
        .then((user) => {
            if (user.resetPasswordToken === 1) {
                user.setPassword(req.body.password, function (err) {
                    if (err) return res.send(err);
                    user.resetPasswordToken = 0;
                    user.save();
                    res.redirect("/signout");
                });
            } else {
                res.send(
                    "Link Expired! <a href='/forget-password'>Try Again.</a>"
                );
            }
        })
        .catch((err) => res.send(err));
});

// ------------------------------------------------------------

router.get("/write", function (req, res, next) {
    res.render("write", { title: "Write Blog" });
});

// ------------------------middlewares---------------------------
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/");
}

router.post("/uploadFile", upload.single("avatar"), function (req, res, next) {
    res.json({
        success: 1,
        file: {
            url: "http://localhost:3000/uploads/" + req.file.filename,
            // any other image data you want to store, such as width, height, color, extension, etc
        },
    });
});

module.exports = router;
