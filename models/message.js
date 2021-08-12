const { Schema, model } = require("mongoose");
const messageSchema = new Schema({
  id: { type: Schema.Types.ObjectId, require: true.valueOf, unique: true },
  author: { type: Schema.Types.ObjectId, require: true },
  sentAt: { type: Date, require: true },
  text: { type: String, require: true },
  readAt: { type: Date },
});
module.exports = model("Message", messageSchema);
