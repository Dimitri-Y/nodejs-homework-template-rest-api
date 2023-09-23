const ctrlShell = require("../models/ctrlShell");
const bcrypt = require("bcryptjs");
const { User } = require("../models/schemas/user");
const jwt = require("jsonwebtoken");
const { nanoid } = require("nanoid");

require("dotenv").config();
const { JWT_SECRET } = process.env;

const path = require("path");
const fs = require("fs").promises;
const multer = require("multer");
const gravatar = require("gravatar");
const Jimp = require("jimp");

const uploadDir = path.join(process.cwd(), "tmp");
const storeImage = path.join(process.cwd(), "public/avatars");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
  limits: {
    fileSize: 1048576,
  },
});

const upload = multer({
  storage: storage,
});

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const register = async (req, res) => {
  const { email, password } = req.body;
  const avatarUrl = gravatar.url(email);
  const verificationToken = nanoid();
  const user = await User.findOne({ email });
  if (user) {
    res.status(409).json({
      status: "error",
      code: 409,
      message: "Email in use",
      data: "Conflict",
    });
  }
  const hashPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    ...req.body,
    avatarURL: avatarUrl,
    password: hashPassword,
    verificationToken: verificationToken,
  });
  const msg = {
    to: email,
    from: "em501avat@meta.ua",
    subject: "You need verification",
    text: `You need to verify using this link ${
      "http://localhost:3000/api/users/verify/" + verificationToken
    } `,
    html: `<strong>${
      "You need to verify using this link http://localhost:3000/api/users/verify/" +
      verificationToken
    }</strong>`,
  };
  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
  res.status(201).json({
    status: "success",
    data: { email: newUser.email, subscription: newUser.subscription },
  });
  await newUser.save();
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(401).json({
      status: "error",
      code: 401,
      message: "Email or password is wrong",
      data: "Conflict",
    });
  }
  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    res.status(401).json({
      status: "error",
      code: 401,
      message: "Email or password is wrong",
      data: "Conflict",
    });
  }
  const { verify } = user;
  if (verify === false) {
    res.status(400).json({
      status: "error",
      code: 400,
      message: "this email is not verified",
      data: "Conflict",
    });
  }
  const payload = {
    id: user._id,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
  await User.findByIdAndUpdate(user._id, { token });
  res.status(200).json({
    message: "OK",
    token,
    data: { email: user.email, subscription: user.subscription },
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });
  res.status(204).json({ message: "No Content" });
};

const currentUser = async (req, res) => {
  const { email, subscription } = req.user;
  res.status(200).json({
    message: "OK",
    data: {
      email: email,
      subscription: subscription,
    },
  });
};

const newAvatar = async (req, res) => {
  const { _id } = req.user;
  const { description } = req.body;
  const { path: temporaryName, originalName } = req.file;
  const img = await Jimp.read(temporaryName);
  await img
    .autocrop()
    .cover(250, 250, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE)
    .writeAsync(temporaryName);
  const fileName = `${_id}${originalName ? "_" + originalName : ""}.jpg`;
  const resultName = path.join(storeImage, fileName);
  await fs.rename(temporaryName, resultName);
  const avatarURL = path.join("avatars", fileName);
  await User.findByIdAndUpdate(_id, { avatarURL });
  res.status(200).json({ avatarUrl: description });
};

const verifyToken = async (req, res) => {
  const { verificationToken } = req.params;
  const result = await User.findOne({ verificationToken: verificationToken });
  if (!result) {
    res.status(404).json({ message: "User not found" });
  }
  const user = await User.findByIdAndUpdate(
    { _id: result._id },
    {
      verificationToken: " ",
      verify: true,
    }
  );
  if (user) {
    res.status(200).json({ message: "Verification successful" });
  }
};

const reVerify = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(404).json({
      message: "missing required field email",
    });
  }
  const user = await User.findOne({ email: email });
  const { verificationToken } = user;
  if (verificationToken === "") {
    res.status(400).json({
      message: "Verification has already been passed",
    });
  }
  const msg = {
    to: email,
    from: "em501avat@meta.ua",
    subject: "You need verification",
    text: `You need to verify using this link ${
      "http://localhost:3000/api/users/verify/" + verificationToken
    } `,
    html: `<strong>${
      "You need to verify using this link http://localhost:3000/api/users/verify/" +
      verificationToken
    }</strong>`,
  };
  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
};
module.exports = {
  register: ctrlShell(register),
  login: ctrlShell(login),
  logout: ctrlShell(logout),
  currentUser: ctrlShell(currentUser),
  newAvatar: ctrlShell(newAvatar),
  verifyToken: ctrlShell(verifyToken),
  reVerify: ctrlShell(reVerify),
  upload,
};
// // using Twilio SendGrid's v3 Node.js Library
// // https://github.com/sendgrid/sendgrid-nodejs
// javascript
// const sgMail = require('@sendgrid/mail')
// sgMail.setApiKey(process.env.SENDGRID_API_KEY)
// const msg = {
//   to: 'test@example.com', // Change to your recipient
//   from: 'test@example.com', // Change to your verified sender
//   subject: 'Sending with SendGrid is Fun',
//   text: 'and easy to do anywhere, even with Node.js',
//   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
// }
// sgMail
//   .send(msg)
//   .then(() => {
//     console.log('Email sent')
//   })
//   .catch((error) => {
//     console.error(error)
//   })
