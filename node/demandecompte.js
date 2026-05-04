const mongoose = require('mongoose');

const DemandeCompteSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true },
  telephone: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ['Professeur', 'Administration', 'Etudiant'], required: true },
  statut: { type: String, enum: ['en_attente', 'accepte', 'refuse'], default: 'en_attente' },
  dateCreation: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DemandeCompte', DemandeCompteSchema);