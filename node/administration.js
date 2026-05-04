const mongoose = require('mongoose');

const AdministrationSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true
  },
  prenom: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  telephone: {
    type: String,
    required: false,
    default: ''
  },
  password: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Administration', AdministrationSchema);