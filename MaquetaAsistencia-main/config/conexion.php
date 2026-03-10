<?php
class Conexion {
    public static function conectar() {
        $host = '127.0.0.1';
        $dbname = 'dbmaquetaasistencia'; 
        $username = 'root';
        $password = 'root'; 

        try {
            $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            return $pdo;
            
        } catch (PDOException $e) {
            // CORRECCIÓN 2: Si falla, devolvemos un JSON perfecto para que JS no colapse
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'status' => 0, 
                'message' => 'Error de Base de Datos: ' . $e->getMessage()
            ]);
            exit(); 
        }
    }
}
?>