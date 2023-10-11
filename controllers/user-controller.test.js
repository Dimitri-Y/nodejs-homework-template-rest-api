const request = require("supertest");
const app = require("../app");
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

const { DB_HOST, EMAIL, PASSWORD } = process.env;

const PORT = 3000;

describe("hooks", function () {
  beforeAll(() => {
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
  });

  afterAll(() => {
    mongoose.disconnect();
    console.log("Робота виконана");
  });

  test("1 to power 2 to equal 1", async (done) => {
    const response = await request(app).post("/api/users/login").send({
      email: EMAIL,
      password: PASSWORD,
    });
    expect(response).toEqual({
      message: "OK",
      data: { email: EMAIL, subscription: "starter" },
    });
  });
});
