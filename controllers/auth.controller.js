const passport = require("passport");

exports.googleAuth = (req, res, next) => {
  console.log("googleAuth controller");
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next);
};

exports.googleAuthCallback = (req, res) => {
  console.log("googleAuthCallback controller");
  passport.authenticate("google", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({ message: "Authentication failed" });
    }

    // Send JWT token to the client
    res.json({
      message: "Authentication successful",
      user,
      token: user.token, // token from passport-config.js
    });
  })(req, res);
};
