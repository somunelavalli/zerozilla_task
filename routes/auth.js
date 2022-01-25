const router = require("express").Router();
const User = require("../models/user");
const cryptoJs = require("crypto-js");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//Register
router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: cryptoJs.AES.encrypt(
      req.body.password,
      process.env.PASS_SECRET
    ).toString(),
  });
  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

//Login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    !user && res.status(401).json("wrong credentials");

    const hashedpassword = cryptoJs.AES.decrypt(
      user.password,
      process.env.PASS_SECRET
    );

    const dbpassword = hashedpassword.toString(cryptoJs.enc.Utf8);
    dbpassword !== req.body.password &&
      res.status(401).json("wrong credentials");
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });
    const { password, ...others } = user._doc;
    res.status(200).json({ ...others, accessToken });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
