const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { uploadToRemote } = require('../utils/remoteStorage');

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

const rawUpload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 200 * 1024 * 1024 } // 200MB limit for high-res photos and videos
});

const processImage = async (file) => {
    if (!file || !file.mimetype.startsWith('image/')) return;
    if (file.mimetype === 'image/gif' || file.mimetype === 'image/webp') return;

    const originalPath = file.path;
    const parsedPath = path.parse(originalPath);
    const webpFilename = parsedPath.name + '.webp';
    const webpPath = path.join(parsedPath.dir, webpFilename);

    try {
        await sharp(originalPath)
            .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(webpPath);
            
        // Eliminar el archivo original
        if (fs.existsSync(originalPath)) {
            fs.unlinkSync(originalPath);
        }
        
        // Actualizar el objeto file para que los controladores usen la nueva ruta
        file.path = webpPath;
        file.filename = webpFilename;
        file.mimetype = 'image/webp';
    } catch (err) {
        console.error('Error procesando imagen con sharp:', err);
    }
};

const processMediaMiddleware = async (req, res, next) => {
    const handleFile = async (file) => {
        await processImage(file);
        
        // Determinar carpeta remota (basada en el dir de multer)
        // file.destination suele ser "uploads/config", "uploads/items", etc.
        const remoteFolder = file.destination ? file.destination.replace('uploads/', '') : 'misc';
        
        // Subir al puente de Hostinger
        await uploadToRemote(file.path, remoteFolder);
    };

    if (req.file) {
        await handleFile(req.file);
    } else if (req.files) {
        if (Array.isArray(req.files)) {
            for (const file of req.files) {
                await handleFile(file);
            }
        } else {
            for (const key in req.files) {
                for (const file of req.files[key]) {
                    await handleFile(file);
                }
            }
        }
    }
    next();
};

const upload = {
    single: (fieldname) => [rawUpload.single(fieldname), processMediaMiddleware],
    array: (fieldname, maxCount) => [rawUpload.array(fieldname, maxCount), processMediaMiddleware],
    fields: (fields) => [rawUpload.fields(fields), processMediaMiddleware],
    // Proxy for raw upload if needed
    raw: rawUpload
};

module.exports = upload;
