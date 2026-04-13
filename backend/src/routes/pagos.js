const express = require('express');
const router = express.Router();
const pagosController = require('../controllers/pagosController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de Multer para Comprobantes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/pagos';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `comprobante-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

// Rutas de Pagos
router.get('/cotizacion/:id', pagosController.getPagosByCotizacion);
router.post('/', upload.single('comprobante'), pagosController.crearPago);
router.put('/:id/aprobar', pagosController.aprobarPago);
router.get('/recibo/:id', pagosController.getReciboData);

module.exports = router;
