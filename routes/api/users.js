const express = require("express");

const router = express.Router();
const { validateBody } = require("../../middlewares/validation");
const user = require("../../models/schemas/user");
const ctrlUser = require("../../controllers/user-controller");
const auth = require("../../middlewares/authValidationToken");

router.post("/register", validateBody(user.registerSchema), ctrlUser.register);

router.post("/login", validateBody(user.authSchema), ctrlUser.login);

router.post("/logout", auth, ctrlUser.logout);

router.get("/current", auth, ctrlUser.currentUser);

router.patch(
  "/avatars",
  auth,
  ctrlUser.upload.single("avatar"),
  ctrlUser.newAvatar
);

module.exports = router;
