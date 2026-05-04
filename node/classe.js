const mongoose = require('mongoose');

const ClasseSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true // ex: "3 Info A"
  },

  niveau: {
    type: String,
    enum: ['1ere', '2eme', '3eme', '4eme'],
    required: true
  },

  specialite: {
    type: String,
    enum: ['informatique', 'lettres', 'science', 'technique','math'],
     required: function () {
    return this.niveau !== '1ere';
     }
    
  },

  groupe: {
    type: String, 
    required: true
  },

  creePar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
});

module.exports = mongoose.model('Classe', ClasseSchema);