const service = require("../service");
const { nanoid } = require("nanoid");
const ctrlShell = require("../models/ctrlShell");

const listContacts = async (req, res) => {
  const result = await service.listContacts();
  res.status(200).json(result);
};
const getContactById = async (req, res) => {
  const { contactId } = req.params;
  const result = await service.getContactById(contactId);
  if (!result) {
    res.status(404).json({ message: "Not found contact their Id" });
  }
  res.status(200).json(result);
};
const addContact = async (req, res) => {
  const { name, email, phone } = req.body;
  const id = nanoid();
  const newContact = await service.addContact({ id, name, email, phone });
  res.status(201).json(newContact);
};
const removeContact = async (req, res, next) => {
  const { contactId } = req.params;
  const deletedContacts = await service.removeContact(contactId);
  if (!deletedContacts) {
    res.status(404).json({ message: "Not found contact with their Id" });
  }
  res.status(200).json({ message: "contact deleted" });
};
const updateContact = async (req, res, next) => {
  const body = req.body;
  if (!body) {
    res.status(404).json({ message: "Enter data, please" });
  }
  const { contactId } = req.params;
  const updatedContact = await service.updateContact(contactId, body);
  if (!updatedContact) {
    res.status(404).json({ message: "Not found contact with their Id" });
  }
  res.json(updatedContact);
};

module.exports = {
  listContacts: ctrlShell(listContacts),
  getContactById: ctrlShell(getContactById),
  removeContact: ctrlShell(removeContact),
  addContact: ctrlShell(addContact),
  updateContact: ctrlShell(updateContact),
};
