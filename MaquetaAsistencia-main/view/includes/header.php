<!DOCTYPE html>
<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['rol'])) {
    header("Location: ../../view/views/VistaLogin.php");
    exit();
}
?> 

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema de Asistencia - Municipalidad de Yerbas Buenas</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet">
    <link rel="stylesheet" href="../../assets/css/style.css?v=2">
</head>
<body>
    <div class="d-flex h-100 vh-100">
        
        <?php include 'menu.php'; ?>

        <main class="main-content">