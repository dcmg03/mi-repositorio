const Zoo = require('../models/zooModel');
const Animal = require('../models/animalModel');

// Obtener todos los zoológicos
exports.getZoos = async (req, res) => {
  try {
    const zoos = await Zoo.find();
    res.json(zoos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Obtener un zoológico específico
exports.getZoo = async (req, res) => {
  try {
    const zoo = await Zoo.findById(req.params.id);
    if (!zoo) return res.status(404).json({ message: 'Zoológico no encontrado' });
    res.json(zoo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Crear un zoológico
exports.createZoo = async (req, res) => {
  const zoo = new Zoo({
    name: req.body.name,
    location: req.body.location,
    geoExtension: req.body.geoExtension,
    animalCapacity: req.body.animalCapacity
  });

  try {
    const newZoo = await zoo.save();
    res.status(201).json(newZoo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Actualizar un zoológico
exports.updateZoo = async (req, res) => {
  try {
    const updatedZoo = await Zoo.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedZoo) return res.status(404).json({ message: 'Zoológico no encontrado' });
    res.json(updatedZoo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Eliminar un zoológico
exports.deleteZoo = async (req, res) => {
  try {
    const deletedZoo = await Zoo.findByIdAndDelete(req.params.id);
    if (!deletedZoo) return res.status(404).json({ message: 'Zoológico no encontrado' });
    res.json({ message: 'Zoológico eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};