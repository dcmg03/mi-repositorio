const jwt = require('jsonwebtoken');
const { User } = require('../models/userModel');

const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Autenticación requerida' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Encontrar al usuario basado en el ID en el token
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Asigna el usuario al request
        req.user = user;

        // Para depuración: asegúrate de que req.user está asignado correctamente
        console.log('Usuario autenticado:', req.user);

        next();
    } catch (error) {
        res.status(401).json({ message: 'Token inválido', error: error.message });
    }
};

module.exports = authMiddleware;
