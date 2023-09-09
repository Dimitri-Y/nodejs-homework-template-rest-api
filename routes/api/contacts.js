const express = require("express");

const router = express.Router();
const { validateBody } = require("../../middlewares/validation");
const schemas = require("../../service/schemas/schema");
const ctrlContact = require("../../controllers");
const isValidId = require("../../middlewares/validateId");

router.get("/", ctrlContact.listContacts);

router.get("/:contactId", isValidId, ctrlContact.getContactById);

router.post("/", validateBody(schemas.addSchema), ctrlContact.addContact);

router.delete("/:contactId", isValidId, ctrlContact.removeContact);

router.put(
  "/:contactId",
  isValidId,
  validateBody(schemas.updateSchema),
  ctrlContact.updateContact
);
router.patch(
  "/:id/favorite",
  isValidId,
  validateBody(schemas.updateFavoriteSchema),
  ctrlContact.updateStatusContact
);

module.exports = router;
