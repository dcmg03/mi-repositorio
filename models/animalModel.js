const mongoose = require('mongoose');


const animalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  species: {
    type: String,
    required: true
  },
  zoo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zoo',
    required: false // Cada animal debe estar asociado a un zoológico, opcional
  }
});

const Animal = mongoose.model('Animal', animalSchema);
module.exports = Animal;
