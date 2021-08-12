const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");


router.post("/api/signup", async (req, res) => {
  const { email, password, name, contactPhone } = req.body;
  const id = uuidv4();
  try {
    const match = await User.findOne({ email: email });
    if (match === undefined) {
      const user = await User.create({
        _id: id,
        email: email,
        name: name,
        contactPhone: contactPhone,
        passwordHash: await genPass(password),
      });
      res.status(200).json({ data: user });
    } else {
      res.status(401).json({ error: "email занят", status: "error" });
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

router.post("/api/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const match = await User.findOne({ email: email });
    let passNotMatch;
    if (match !== undefined) {
      passNotMatch = bcrypt.compareSync(password, match.passwordHash);
    }
    if (match === undefined || !passNotMatch)
      res
        .status(401)
        .json({ error: "Неверный логин или пароль", status: "error" });
    else
      res.status(200).json({
        data: {
          id: match.id,
          email: match.email,
          name: match.name,
          contactPhone: match.contactPhone,
        },
      });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

async function genPass(pass) {
  const saltRound = 10;
  return await bcrypt.hash(pass, saltRound);
}

module.exports = router;
