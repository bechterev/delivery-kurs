const express = require("express");
const router = express.Router();
const ChatModule = require("../models/chat");

router.get("/chat", async (req, res) => {
  const { id } = res.params;
  const chat = await ChatModule.findById(id);
});

router.post("/chat", async (req, res) => {
  const chat = await ChatModule.create(data);
});

module.exports = router;
