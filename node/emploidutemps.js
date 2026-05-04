const mongoose = require('mongoose');

const emploiSchema = new mongoose.Schema({
  classe: { type: mongoose.Schema.Types.ObjectId, ref: 'Classe', required: true },
  jour: { type: String, enum: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'], required: true },
  heureDebut: { type: String, required: true },
  heureFin: { type: String, required: true },
  matiere: { type: mongoose.Schema.Types.ObjectId, ref: 'Matiere' },
  professeur: { type: mongoose.Schema.Types.ObjectId, ref: 'Professeur' },
  salle: { type: String }
});

module.exports = mongoose.model('EmploiDuTemps', emploiSchema);