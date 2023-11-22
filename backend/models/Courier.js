const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//  Mongoose schema for courier shipments
const CourierSchema = Schema({
  courierNumber: {
    type: String,
    unique: true,
    required: true
  },
  courierCompany: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  estimatedDelivery: {
    type: Date
  },
  trackingHistory: [{
    status: String,
    location: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  senderName: {
    type: String,
    required: true
  },
  senderAddress: {
    type: String,
    required: true
  },
  receiverName: {
    type: String,
    required: true
  },
  receiverAddress: {
    type: String,
    required: true
  },
  contents: {
    type: String
  },
  additionalInfo: {
    type: String
  }
});

//model from the schema
const Courier = mongoose.model('Courier', CourierSchema);

module.exports = Courier;
