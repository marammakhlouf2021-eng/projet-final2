const mongoose = require('mongoose');

const ProfesseurSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: String,
  email: { type: String, required: true },
  telephone: String,
  password: String,
  matieresAutorisees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Matiere'
  }]
});

module.exports = mongoose.model('Professeur', ProfesseurSchema);