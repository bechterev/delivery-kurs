const express = require("express");
const router = express.Router();
const Ad = require("../models/ad");
const fileMW = require("../middleware/file");
const { v4: uuidv4 } = require("uuid");

router.get("/api/advertisements", async (req, res) => {
  try {
    const ads = await Ad.find();
    res.status(200).json({ data: ads });
  } catch (err) {
    res.status(401).json({ error: "not found advertisements" });
  }
});
router.get("/api/advertisements/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const ads = await Ad.findOne({ id: id });
    res.status(200).json({ data: ads });
  } catch (err) {
    res.status(401).json({ error: "not found advertisement" });
  }
});

router.post(
  "/api/advertisements",
  function (req, res, next) {
    if (req.isAuthenticated()) {
      //req.isAuthenticated() will return true if user is logged in
      next();
    } else {
      res.status(401).json({ error: `you have not been authenticated` });
    }
  },
  fileMW.single("images"),
  async (req, res) => {
    const id = uuidv4();
    const { shortTitle, description } = req.body;
    let path;
    if (req.file) {
      path = req.file.path;
    }
    const ad = await Ad.create({
      id: id,
      shortTitle: shortTitle,
      description: description,
      user_id: req.session.passport.user,
      create_at: Date.now(),
      images: path,
    });
    res.status(200).json({ data: ad });
  }
);

router.delete("/api/advertisements/:id", async (req, res) => {
  const { id } = res.params;
  const ad = await Ad.deleteOne({ id: id });
});

module.exports = router;
