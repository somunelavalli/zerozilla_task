const mongoose = require("mongoose");

const agencySchema = new mongoose.Schema({
  agencyId: { type: String, required: true },
  name: { type: String, required: true },
  address1: { type: String, required: true },
  address2: { type: String },
  state: { type: String, required: true },
  city: { type: String, required: true },
  phoneNumber: { type: Number, required: true },
});

module.exports = mongoose.model("Agency", agencySchema);
