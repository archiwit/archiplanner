const express = require('express');
const router = express.Router();
const gastosController = require('../controllers/gastosController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de Multer para Comprobantes de Gastos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/gastos';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `gasto-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

// Rutas de Gastos
router.get('/cotizacion/:id', gastosController.getGastosByCotizacion);
router.post('/', upload.single('comprobante'), gastosController.crearGasto);
router.patch('/:id/estado', gastosController.updateGastoEstado);
router.delete('/:id', gastosController.eliminarGasto);

module.exports = router;
