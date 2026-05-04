const mongoose = require('mongoose');

const SemestreSchema = new mongoose.Schema({
  classe: { type: mongoose.Schema.Types.ObjectId, ref: 'Classe', required: true },
  semestre: { type: String, enum: ['S1', 'S2'], required: true },
  statut: { type: String, enum: ['en_cours', 'cloture'], default: 'en_cours' },
  dateCreation: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Semestre', SemestreSchema);