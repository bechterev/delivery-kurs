const { Schema, model } = require("mongoose");
const userSchema = new Schema({
  id: { type: Schema.Types.ObjectId, require: true, unique: true },
  email: { type: String, require: true, unique: true },
  passwordHash: { type: String, require: true },
  name: { type: String, require: true },
  contactPhone: { type: String },
});
module.exports = model("User", userSchema);
