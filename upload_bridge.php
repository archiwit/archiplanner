<?php
/**
 * ArchiPlanner - Storage Bridge
 * Este archivo permite al backend de Render guardar archivos en Hostinger.
 */

// --- CONFIGURACIÓN ---
$SECRET_TOKEN = "archi_bridge_2024_secure_99"; // Token de seguridad
$BASE_UPLOAD_DIR = "uploads/"; // Carpeta base de subidas

// --- SEGURIDAD ---
$received_token = $_POST['token'] ?? $_SERVER['HTTP_X_STORAGE_TOKEN'] ?? '';

if ($received_token !== $SECRET_TOKEN) {
    header('HTTP/1.1 403 Forbidden');
    echo json_encode(["error" => "No autorizado"]);
    exit;
}

// --- PROCESAMIENTO ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    $folder = $_POST['folder'] ?? 'misc';
    // Limpiar nombre de carpeta por seguridad
    $folder = preg_replace('/[^a-zA-Z0-9_\-\/]/', '', $folder);
    
    $target_dir = $BASE_UPLOAD_DIR . $folder . "/";
    
    if (!file_exists($target_dir)) {
        mkdir($target_dir, 0755, true);
    }

    if (isset($_FILES['file'])) {
        $file = $_FILES['file'];
        $filename = basename($file['name']);
        // Limpiar nombre de archivo
        $filename = preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', $filename);
        
        $target_file = $target_dir . $filename;

        if (move_uploaded_file($file['tmp_name'], $target_file)) {
            echo json_encode([
                "success" => true,
                "path" => $folder . "/" . $filename,
                "full_url" => "https://" . $_SERVER['HTTP_HOST'] . "/" . $target_file
            ]);
        } else {
            header('HTTP/1.1 500 Internal Server Error');
            echo json_encode(["error" => "Error al mover el archivo"]);
        }
    } else {
        echo json_encode(["error" => "No se recibió ningún archivo"]);
    }
} else {
    echo json_encode(["message" => "ArchiPlanner Storage Bridge Active"]);
}
