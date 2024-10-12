const express = require('express');
const Animal = require('../models/animalModel');
const Zoo = require('../models/zooModel'); // Importar el modelo de Zoo
const authMiddleware = require('../middlewares/auth'); // Middleware de autenticación JWT

const router = express.Router();


/**
 * @swagger
 * components:
 *   schemas:
 *     Animal:
 *       type: object
 *       required:
 *         - name
 *         - species
 *         - zoo
 *       properties:
 *         name:
 *           type: string
 *           description: El nombre del animal
 *         species:
 *           type: string
 *           description: La especie del animal
 *         zoo:
 *           type: string
 *           description: El ID del zoológico al que pertenece
 */

/**
 * @swagger
 * /api/animals/no-zoo:
 *   post:
 *     summary: Crear un nuevo animal sin asociación a un zoológico
 *     tags: [Animales]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del animal
 *               species:
 *                 type: string
 *                 description: Especie del animal
 *     responses:
 *       201:
 *         description: Animal creado exitosamente
 *       400:
 *         description: Error al crear el animal
 */
router.post('/no-zoo', async (req, res) => {
    const { name, species } = req.body;

    // Verificar que los campos requeridos estén presentes
    if (!name || !species) {
        return res.status(400).json({ message: 'Faltan campos requeridos: name y species' });
    }

    try {
        // Crear el nuevo animal sin asociación a un zoológico
        const newAnimal = new Animal({
            name,
            species,
        });

        await newAnimal.save();
        res.status(201).json(newAnimal);
    } catch (error) {
        res.status(400).json({ message: 'Error al crear el animal', error: error.message });
    }
});




/**
 * @swagger
 * /api/animals:
 *   post:
 *     summary: Crear un nuevo animal asociado a un zoológico
 *     tags: [Animales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Animal'
 *     responses:
 *       201:
 *         description: Animal creado exitosamente
 *       400:
 *         description: Error al crear el animal
 */
router.post('/', authMiddleware, async (req, res) => {
    const {name, species, zoo} = req.body;

    try {
        // Verificar si el zoológico existe
        const foundZoo = await Zoo.findById(zoo);
        if (!foundZoo) {
            return res.status(404).json({message: 'Zoológico no encontrado'});
        }

        // Crear el nuevo animal asociado al zoológico
        const newAnimal = new Animal({
            name,
            species,
            zoo: foundZoo._id
        });

        await newAnimal.save();

        res.status(201).json(newAnimal);
    } catch (error) {
        res.status(400).json({message: 'Error al crear el animal', error: error.message});
    }
});


/**
 * @swagger
 * /api/animals/zoo/{zooId}:
 *   get:
 *     summary: Obtener todos los animales asociados a un zoológico
 *     tags: [Animales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: zooId
 *         schema:
 *           type: string
 *         required: true
 *         description: El ID del zoológico
 *     responses:
 *       200:
 *         description: Lista de animales del zoológico
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Animal'
 *       404:
 *         description: No se encontraron animales para este zoológico
 *       500:
 *         description: Error al obtener los animales
 */
router.get('/zoo/:zooId', authMiddleware, async (req, res) => {
    try {
        const animals = await Animal.find({zoo: req.params.zooId}).populate('zoo', 'name location');
        if (animals.length === 0) {
            return res.status(404).json({message: 'No se encontraron animales para este zoológico'});
        }
        res.status(200).json(animals);
    } catch (error) {
        res.status(500).json({message: 'Error al obtener los animales', error: error.message});
    }
});


/**
 * @swagger
 * /api/animals/{id}:
 *   get:
 *     summary: Obtener un animal por ID asociado a un zoológico
 *     tags: [Animales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: El ID del animal
 *     responses:
 *       200:
 *         description: Animal encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Animal'
 *       404:
 *         description: Animal no encontrado
 *       500:
 *         description: Error al obtener el animal
 */
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const animal = await Animal.findById(req.params.id).populate('zoo', 'name location');
        if (!animal) {
            return res.status(404).json({message: 'Animal no encontrado'});
        }
        res.status(200).json(animal);
    } catch (error) {
        res.status(500).json({message: 'Error al obtener el animal', error});
    }
});


/**
 * @swagger
 * /api/animals/{id}:
 *   put:
 *     summary: Actualizar un animal por ID asociado a un zoológico
 *     tags: [Animales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: El ID del animal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Animal'
 *     responses:
 *       200:
 *         description: Animal actualizado
 *       404:
 *         description: Animal no encontrado
 *       500:
 *         description: Error al actualizar el animal
 */
router.put('/:id', authMiddleware, async (req, res) => {
    const {name, species, zoo} = req.body;
    try {
        //verificar si el zoologico existe
        const foundZoo = await Zoo.findById(zoo)
        if (!foundZoo) {
            return res.status(404).json({message: 'zoologico no encontrado'});
        }

        // Actualizar el animal asociado al zoológico
        const animal = await Animal.findByIdAndUpdate(req.params.id, {name, species, zoo: foundZoo._id}, {new: true});
        if (!animal) {
            return res.status(404).json({message: 'Animal no encontrado'});
        }
        res.status(200).json(animal);
    } catch (error) {
        res.status(500).json({message: 'Error al actualizar el animal', error});
    }
});

/**
 * @swagger
 * /api/animals/{id}:
 *   delete:
 *     summary: Eliminar un animal por ID asociado a un zoológico
 *     tags: [Animales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: El ID del animal
 *     responses:
 *       200:
 *         description: Animal eliminado exitosamente
 *       404:
 *         description: Animal no encontrado
 *       500:
 *         description: Error al eliminar el animal
 */

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const animal = await Animal.findById(req.params.id);
        if (!animal) {
            return res.status(404).json({ message: 'Animal no encontrado' });
        }

        // Verificar si el zoológico asociado al animal existe
        const zoo = await Zoo.findById(animal.zoo);
        if (!zoo) {
            return res.status(404).json({ message: 'Zoológico no encontrado' });
        }

        await Animal.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Animal eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el animal', error });
    }
});


module.exports = router;