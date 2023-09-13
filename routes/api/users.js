const express = require("express");

const router = express.Router();
const { validateBody } = require("../../middlewares/validation");
const user = require("../../models/schemas/user");
const ctrlUser = require("../../controllers/user-controller");

router.post("/register", validateBody(user.registerSchema), ctrlUser.register);
router.post("/login", validateBody(user.authSchema), ctrlUser.login);
module.exports = router;
