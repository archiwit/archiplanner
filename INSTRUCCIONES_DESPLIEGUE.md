# Guía de Despliegue - ArchiPlanner V4 (Hostinger)

He preparado los archivos necesarios para subir a tu hosting. Sigue estos pasos para que todo funcione correctamente.

## 1. Crear la Base de Datos en Hostinger
1. Entra a tu **hPanel** de Hostinger.
2. Ve a **Bases de Datos** -> **Bases de Datos MySQL**.
3. Crea una nueva base de datos y un usuario (ej: `archi_db` y `archi_user`).
4. **IMPORTANTE**: Anota el nombre de la DB, el usuario y la contraseña.
5. Ve a **phpMyAdmin** dentro de Hostinger, abre la base de datos y usa la pestaña "Importar" para subir tu archivo SQL (el que usas localmente).

## 2. Preparar el Backend
1. He creado un archivo llamado `backend/.env.production.example`.
2. Renómbralo a `.env` cuando lo subas al servidor.
3. Edita los valores de `DB_USER`, `DB_PASS` y `DB_NAME` con los que creaste en el paso anterior.

## 3. Subida por FTP (Recomendado: FileZilla)
Debes subir los archivos a las siguientes carpetas:

### Frontend (Vista del Cliente)
- Sube el **contenido** de la carpeta `frontend/dist/` directamente a la carpeta `/public_html/` de tu hosting.
- Asegúrate de que el archivo `.htaccess` esté incluido.

### Backend (API)
- Sube la carpeta `backend/` a tu hosting. Lo ideal es subirla una carpeta arriba de `public_html` por seguridad, pero si tu plan es "normal", puedes subirla a `/public_html/api`.

## 4. Configurar Node.js en Hostinger
1. En hPanel, busca la sección **Node.js**.
2. Selecciona la versión de Node (recomiendo 18 o 20).
3. Configura la ruta de la aplicación: `/public_html/api` (o donde hayas subido el backend).
4. El archivo de inicio debe ser: `src/index.js`.
5. Haz clic en **Instalar dependencias** (npm install).
6. Haz clic en **Iniciar**.

---

### Archivos Ya Generados:
- **`frontend/dist/`**: Contiene todo el código de React ya compilado y optimizado.
- **`.htaccess`**: Configurado para que las rutas de React no den error 404.
- **`.env.production.example`**: Plantilla para tu conexión a base de datos segura.
