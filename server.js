const app = require("./app");
const path = require("path");
const fs = require("fs").promises;

const uploadDir = path.join(process.cwd(), "public/uploads");
const storeImage = path.join(process.cwd(), "public/avatars");

const mongoose = require("mongoose");

const isAccessible = (path) => {
  return fs
    .access(path)
    .then(() => true)
    .catch(() => false);
};

const createFolderIsNotExist = async (folder) => {
  if (!(await isAccessible(folder))) {
    await fs.mkdir(folder);
  }
};

const { DB_HOST } = process.env;
const PORT = 3000;
// const DB_HOST =
//   "mongodb+srv://admin:tLSReGZYE3o43gQd@cluster0.tj2yeha.mongodb.net/";

// const optionsConnect = {
//   promiseLibrary: global.Promise,
//   useCreateIndex: true,
//   useUnifiedTopology: true,
//   useFindAndModify: false,
// };

mongoose
  .connect(DB_HOST)
  .then(() => {
    app.listen(PORT, () => {
      createFolderIsNotExist(uploadDir);
      createFolderIsNotExist(storeImage);
      console.log(`Database connection successful`);
    });
  })
  .catch((err) => {
    console.log(`Server not running. Error message: ${err.message}`);
    process.exit(1);
  });
