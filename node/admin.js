const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({

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
        required: true
    },

    password: {
        type: String
    }

});

module.exports = mongoose.model('Admin', AdminSchema);