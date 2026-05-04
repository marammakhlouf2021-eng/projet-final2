const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  etudiant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Etudiant',
    required: true
  },
  matiere: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Matiere',
    required: true
  },
  note: { type: Number, required: true },
  type: {
    type: String,
    enum: ['DS1', 'DS2', 'Examen', 'TP'],
    required: true
  },
  semestre: {
    type: String,
    enum: ['S1', 'S2'],
    default: 'S1'
  },
  saisirPar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professeur'
  }
});

module.exports = mongoose.model('Note', NoteSchema);