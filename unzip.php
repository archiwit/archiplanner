<?php
$zip = new ZipArchive;
$res = $zip->open('deploy.zip');
if ($res === TRUE) {
    // This will extract the 'assets' directory right into the current directory (public_html root)
    $zip->extractTo(__DIR__);
    $zip->close();
    echo "OK";
    
    // Cleanup
    unlink('deploy.zip');
    unlink(__FILE__); // self delete
} else {
    echo "FAILED";
}
?>
