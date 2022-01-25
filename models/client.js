const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  // ClientId, AgencyId, Name, Email, PhoneNumber, TotalBill (all are required fields)
  clientId: { type: String, required: true },
  agencyId: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: Number, required: true },
  totalBill: { type: Number, required: true },
});

module.exports = mongoose.model("Client", clientSchema);
