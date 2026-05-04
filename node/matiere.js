const mongoose = require('mongoose');

const MatiereSchema = new mongoose.Schema({
  nom: { type: String, required: true },

  classes: [
  {
    classe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classe'
    },
    coefficient: {
      type: Number,
      default: 1
    },
    profId: {           // professeur assigné à cette classe pour cette matière
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Professeur',
      default: null
    }
  }
],

  professeur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professeur'
  },

  profsAutorises: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Professeur' }
  ],

  pourcentages: {
    DS1: { type: Number, default: 25 },
    DS2: { type: Number, default: 25 },
    Examen: { type: Number, default: 40 },
    TP: { type: Number, default: 10 }
  }
});

module.exports = mongoose.model('Matiere', MatiereSchema);