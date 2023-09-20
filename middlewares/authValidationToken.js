const { User } = require("../models/schemas/user");
const jwt = require("jsonwebtoken");

require("dotenv").config();

// const passport = require("passport");
// const passportJWT = require("passport-jwt");

// const ExtractJWT = passportJWT.ExtractJwt;
// const Strategy = passportJWT.Strategy;
// const params = {
//   secretOrKey: process.env.JWT_SECRET,
//   jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
// };

// passport.use(
//   new Strategy(params, function (payload, done) {
//     User.find({ _id: payload.id })
//       .then(([user]) => {
//         if (!user) {
//           return done(new Error("User not found"));
//         }
//         return done(null, user);
//       })
//       .catch((err) => done(err));
//   })
// );
const auth = async (req, res, next) => {
  const { authorization = "" } = req.headers;
  const [bearer, token] = authorization.split(" ");
  if (bearer !== "Bearer") {
    next(Error(`401: "Not authorized"`));
  }
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(id);
    if (!user || !user.token || user.token !== token) {
      next(Error(`401: "Not authorized"`));
    }
    req.user = user;
    next();
  } catch {
    next(Error(`401: "Not authorized "`));
  }
};
// const auth = (req, res, next) => {
//   passport.authenticate("jwt", { session: false }, (err, user) => {
//     if (!user || err) {
//       return res.status(401).json({
//         status: "error",
//         code: 401,
//         message: `Unauthorized ${req.headers.autorization}`,
//         data: "Unauthorized",
//       });
//     }
//     req.user = user;
//     next();
//   })(req, res, next);
// };
module.exports = auth;
