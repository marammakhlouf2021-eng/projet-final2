const mongoose = require('mongoose');

const EtudiantSchema = new mongoose.Schema({
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
    type: String
  },
  classe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classe',
    required: false
  }
});

module.exports = mongoose.model('Etudiant', EtudiantSchema);