const fs = require('fs');
const path = require('path');

/**
 * Safely deletes one or more files from the filesystem.
 * @param {string|string[]} filePaths - Relative path(s) to the file(s) starting from the backend root or absolute paths.
 * @param {string} [baseDir] - Optional base directory (defaults to backend root).
 */
const deleteFiles = (filePaths, baseDir = path.join(__current_dir, '../../')) => {
    if (!filePaths) return;
    
    const pathsArray = Array.isArray(filePaths) ? filePaths : [filePaths];
    
    pathsArray.forEach(filePath => {
        if (!filePath) return;
        
        try {
            // If the path starts with /uploads, it's relative to backend root
            let fullPath = filePath;
            if (!path.isAbsolute(filePath)) {
                // If it starts with / or \, remove it to join correctly
                const cleanPath = filePath.replace(/^[\/\\]+/, '');
                fullPath = path.join(__dirname, '../../', cleanPath);
            }
            
            if (fs.existsSync(fullPath)) {
                console.log(`[FileManager] Deleting file: ${fullPath}`);
                fs.unlinkSync(fullPath);
            } else {
                console.log(`[FileManager] File not found, skipping: ${fullPath}`);
            }
        } catch (err) {
            console.error(`[FileManager] Error deleting file ${filePath}:`, err.message);
        }
    });
};

module.exports = {
    deleteFiles
};
