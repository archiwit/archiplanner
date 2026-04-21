const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dir = 'uploads/items'; // Default para inventario
        
        const url = req.originalUrl || req.path || '';
        
        if (file.fieldname === 'logo' || url.includes('config')) {
            dir = 'uploads/config';
        } else if (url.includes('usuario') || url.includes('perfil')) {
            dir = 'uploads/users';
        } else if (url.includes('proveedor')) {
            dir = 'uploads/providers';
        } else if (url.includes('articulo')) {
            dir = 'uploads/items';
        } else if (url.includes('testimonial') || url.includes('testimonio')) {
            dir = 'uploads/testimonials';
        } else if (url.includes('servicio') || url.includes('servicios') || url.includes('ctas')) {
            dir = 'uploads/services';
        } else if (url.includes('historias')) {
            dir = 'uploads/stories';
        } else if (url.includes('galeria') || url.includes('gallery') || url.includes('secciones')) {
            dir = 'uploads/gallery';
        } else if (url.includes('encuesta')) {
            dir = 'uploads/surveys';
        }
        
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const url = req.originalUrl || req.path || '';
        
        let prefix = 'item-';
        if (file.fieldname === 'logo' || url.includes('config')) prefix = 'logo-';
        else if (url.includes('usuario') || url.includes('perfil')) prefix = 'user-';
        else if (url.includes('proveedor')) prefix = 'prov-';
        else if (url.includes('testimonial') || url.includes('testimonio')) prefix = 'test-';
        else if (url.includes('servicio') || url.includes('servicios')) prefix = 'serv-';
        else if (url.includes('historias')) prefix = 'story-';
        else if (url.includes('galeria') || url.includes('gallery') || url.includes('secciones')) prefix = 'hero-';
        else if (url.includes('encuesta')) prefix = 'survey-';
        
        cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype.startsWith('image/') || 
        file.mimetype.startsWith('video/') || 
        file.mimetype.startsWith('audio/') || 
        file.mimetype === 'application/pdf'
    ) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes, videos, audios o documentos PDF'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 200 * 1024 * 1024 } // 200MB limit for high-res photos and videos
});

module.exports = upload;
