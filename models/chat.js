const { Schema, model } = require("mongoose");
const Message = require('./message');
const chatSchema = new Schema({
  id: { type: Schema.Types.ObjectId, require: true, unique: true },
  users: { type: [Schema.Types.ObjectId, Schema.Types.ObjectId], require: true },
  createdAt: { type: Date, require: true },
  messages: { type: [Schema.Types.ObjectId],ref:Message },
});
module.exports = model("Chat", chatSchema);
