const { Schema, model} = require('mongoose');
const adSchema = new Schema({
  id: { type: Schema.Types.ObjectId, require: true, unique: true },
  shortText: { type: String, require: true },
  description: { type: String },
  images: { type: [String] },
  userId: { type: Schema.Types.ObjectId, require: true },
  createdAt: { type: Date, require: true },
  updatedAt: { type: Date, require: true },
  tags: { type: [Schema.Types.string] },
  isDeleted: { type: Boolean, require: true },
});
module.exports = model("Ad", adSchema);
