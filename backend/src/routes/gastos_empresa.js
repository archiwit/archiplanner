const express = require('express');
const router = express.Router();
const gastosEmpresaController = require('../controllers/gastosEmpresaController');
const upload = require('../middleware/upload');

// All routes are prefixed with /api/gastos-empresa in index.js
router.get('/', gastosEmpresaController.getAll);
router.get('/reportes', gastosEmpresaController.getReportes);
router.post('/', upload.single('comprobante'), gastosEmpresaController.create);
router.put('/:id', upload.single('comprobante'), gastosEmpresaController.update);
router.delete('/:id', gastosEmpresaController.delete);

module.exports = router;
