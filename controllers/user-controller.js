const ctrlShell = require("../models/ctrlShell");
const bcrypt = require("bcryptjs");
const { User } = require("../models/schemas/user");
const jwt = require("jsonwebtoken");

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

const register = async (req, res) => {
  const { email, password } = req.body;
  const avatarUrl = gravatar.url(email);
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

module.exports = {
  register: ctrlShell(register),
  login: ctrlShell(login),
  logout: ctrlShell(logout),
  currentUser: ctrlShell(currentUser),
  newAvatar: ctrlShell(newAvatar),
  upload,
};
