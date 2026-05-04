const mongoose = require('mongoose');

const AbsenceSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['absence', 'retard'],
    default: 'absence'
  },
  dureeRetard: {
    type: Number,
    default: 0
  },
  justifiee: {
    type: Boolean,
    default: false
  },
  saisirPar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professeur'
  }
});

module.exports = mongoose.model('Absence', AbsenceSchema);