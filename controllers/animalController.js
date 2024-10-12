const Animal = require('../models/animalModel');
const Zoo = require('../models/zooModel');

// Obtener todos los animales
exports.getAnimals = async (req, res) => {
  try {
    const animals = await Animal.find().populate('zoo');
    res.json(animals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Obtener un animal por ID
exports.getAnimalById = async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id).populate('zoo');
    if (!animal) {
      return res.status(404).json({ message: 'Animal no encontrado' });
    }
    res.json(animal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Crear un animal
exports.createAnimal = async (req, res) => {
  const animal = new Animal({
    name: req.body.name,
    species: req.body.species,
    zoo: req.body.zoo,
  });

  try {
    const newAnimal = await animal.save();
    // Asociar el animal al zoológico
    const zoo = await Zoo.findById(req.body.zoo);
    if (!zoo) {
      return res.status(404).json({ message: 'Zoológico no encontrado' });
    }
    zoo.animals.push(newAnimal._id);
    await zoo.save();
    res.status(201).json(newAnimal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Actualizar un animal
exports.updateAnimal = async (req, res) => {
  try {
    const updatedAnimal = await Animal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedAnimal) {
      return res.status(404).json({ message: 'Animal no encontrado' });
    }
    res.json(updatedAnimal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Eliminar un animal
exports.deleteAnimal = async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);
    if (!animal) {
      return res.status(404).json({ message: 'Animal no encontrado' });
    }
    
    // Eliminar la referencia del animal en el zoológico
    const zoo = await Zoo.findById(animal.zoo);
    if (zoo) {
      zoo.animals = zoo.animals.filter(animalId => animalId.toString() !== animal._id.toString());
      await zoo.save();
    }

    await Animal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Animal eliminado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};