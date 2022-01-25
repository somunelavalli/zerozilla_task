const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = process.env.PORT || 4000;
require("dotenv").config();

app.use(express.json());

//Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("DB connected Successfully"))
  .catch((err) => {
    console.log(err);
  });

//Routes
app.use("/api/", require("./routes/create"));
app.use("/api/", require("./routes/auth"));

app.listen(port, () => {
  console.log("Server is running on Port " + port);
});
