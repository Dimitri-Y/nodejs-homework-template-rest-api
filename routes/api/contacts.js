const express = require("express");

const router = express.Router();
const { validateBody } = require("../../middlewares/validation");
const contacts = require("../../models/contacts");
const { nanoid } = require("nanoid");
const schemas = require("../../schema");

router.get("/", async (req, res) => {
  const result = await contacts.listContacts();
  res.status(200).json(result);
});

router.get("/:contactId", async (req, res) => {
  const { contactId } = req.params;
  const result = await contacts.getContactById(contactId);
  if (!result) {
    res.status(404).json({ message: "Not found contact their Id" });
  }
  res.status(200).json(result);
});

router.post("/", validateBody(schemas.addSchema), async (req, res) => {
  const { name, email, phone } = req.body;
  const id = nanoid();
  const newContact = await contacts.addContact({ id, name, email, phone });
  res.status(201).json(newContact);
});

router.delete("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  const deletedContacts = await contacts.removeContact(contactId);
  if (!deletedContacts) {
    res.status(404).json({ message: "Not found contact with their Id" });
  }
  res.status(200).json({ message: "contact deleted" });
});
// validateBody(schemas.addSchema)
// validateBody(schemas.updateSchema)
router.put(
  "/:contactId",
  validateBody(schemas.updateSchema),
  async (req, res, next) => {
    const body = req.body;
    if (!body) {
      res.status(404).json({ message: "Enter data, please" });
    }
    const { contactId } = req.params;
    const updatedContact = await contacts.updateContact(contactId, body);
    if (!updatedContact) {
      res.status(404).json({ message: "Not found contact with their Id" });
    }
    res.json(updatedContact);
  }
);

module.exports = router;
