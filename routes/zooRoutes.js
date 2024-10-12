const express = require('express');
const Zoo = require('../models/zooModel');  // Modelo de Zoo
const authMiddleware = require('../middlewares/auth');  // Middleware de autenticación JWT
const Animal = require('../models/animalModel'); // Asegúrate de que el path es correcto

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Zoo:
 *       type: object
 *       required:
 *         - name
 *         - location
 *       properties:
 *         name:
 *           type: string
 *           description: El nombre del zoológico
 *         location:
 *           type: string
 *           description: La ubicación del zoológico
 *         animals:
 *           type: array
 *           items:
 *             type: string
 *           description: IDs de los animales que pertenecen al zoológico
 */

/**
 * @swagger
 * /api/zoos:
 *   post:
 *     summary: Crear un nuevo zoológico
 *     tags: [Zoos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Zoo'
 *     responses:
 *       201:
 *         description: Zoológico creado exitosamente
 *       400:
 *         description: Error al crear el zoológico
 */
router.post('/', authMiddleware, async (req, res) => {
    const { name, location, animals } = req.body;

    try {
        // Verificar que los IDs de animales existan
        const foundAnimals = await Animal.find({ '_id': { $in: animals } });

        if (foundAnimals.length !== animals.length) {
            return res.status(400).json({ message: 'Uno o más animales no existen en la base de datos' });
        }

        // Crear el nuevo zoológico
        const newZoo = new Zoo({
            name,
            location,
            animals: foundAnimals.map(animal => animal._id)  // Solo asignar los IDs que existen
        });

        await newZoo.save();
        res.status(201).json(newZoo);

    } catch (error) {
        res.status(400).json({ message: 'Error al crear el zoológico', error: error.message });
    }
});


/**
 * @swagger
 * /api/zoos:
 *   get:
 *     summary: Obtener todos los zoológicos
 *     tags: [Zoos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todos los zoológicos
 *       500:
 *         description: Error al obtener los zoológicos
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const zoos = await Zoo.find().populate('animals');
        res.json(zoos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los zoológicos', error: error.message });
    }
});

/**
 * @swagger
 * /api/zoos/{id}:
 *   get:
 *     summary: Obtener un zoológico por ID
 *     tags: [Zoos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: El ID del zoológico
 *     responses:
 *       200:
 *         description: Zoológico encontrado
 *       404:
 *         description: Zoológico no encontrado
 *       500:
 *         description: Error al obtener el zoológico
 */
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const zoo = await Zoo.findById(req.params.id).populate('animals');
        if (!zoo) {
            return res.status(404).json({ message: 'Zoológico no encontrado' });
        }
        res.json(zoo);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el zoológico', error: error.message });
    }
});

/**
 * @swagger
 * /api/zoos/{id}:
 *   put:
 *     summary: Actualizar un zoológico por ID
 *     tags: [Zoos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: El ID del zoológico
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Zoo'
 *     responses:
 *       200:
 *         description: Zoológico actualizado
 *       404:
 *         description: Zoológico no encontrado
 *       400:
 *         description: Error al actualizar el zoológico
 */
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const updatedZoo = await Zoo.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedZoo) {
            return res.status(404).json({ message: 'Zoológico no encontrado' });
        }
        res.json(updatedZoo);
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar el zoológico', error: error.message });
    }
});

/**
 * @swagger
 * /api/zoos/{id}:
 *   delete:
 *     summary: Eliminar un zoológico por ID
 *     tags: [Zoos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: El ID del zoológico
 *     responses:
 *       200:
 *         description: Zoológico eliminado exitosamente
 *       404:
 *         description: Zoológico no encontrado
 *       500:
 *         description: Error al eliminar el zoológico
 */
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const deletedZoo = await Zoo.findByIdAndDelete(req.params.id);
        if (!deletedZoo) {
            return res.status(404).json({ message: 'Zoológico no encontrado' });
        }
        res.json({ message: 'Zoológico eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el zoológico', error: error.message });
    }
});

module.exports = router;
