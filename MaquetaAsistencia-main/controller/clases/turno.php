<?php
require_once __DIR__ . '/../../config/conexion.php';

class Turno {
    public static function obtenerTodos() {
        try {
            $pdo = Conexion::conectar();
            $stmt = $pdo->prepare("SELECT IDturno, nombre, hora_entrada, hora_salida FROM turnos ORDER BY nombre ASC");
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) { 
            throw new Exception("Error BD: " . $e->getMessage()); 
        }
    }

    public static function crear($nombre, $entrada, $salida) {
        try {
            $pdo = Conexion::conectar();
            $stmt = $pdo->prepare("INSERT INTO turnos (nombre, hora_entrada, hora_salida) VALUES (:nom, :ent, :sal)");
            $stmt->bindParam(':nom', $nombre);
            $stmt->bindParam(':ent', $entrada);
            $stmt->bindParam(':sal', $salida);
            return $stmt->execute();
        } catch (PDOException $e) { 
            throw new Exception("Error BD: " . $e->getMessage()); 
        }
    }

    public static function actualizar($id, $nombre, $entrada, $salida) {
        try {
            $pdo = Conexion::conectar();
            $stmt = $pdo->prepare("UPDATE turnos SET nombre = :nom, hora_entrada = :ent, hora_salida = :sal WHERE IDturno = :id");
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':nom', $nombre);
            $stmt->bindParam(':ent', $entrada);
            $stmt->bindParam(':sal', $salida);
            return $stmt->execute();
        } catch (PDOException $e) { 
            throw new Exception("Error BD: " . $e->getMessage()); 
        }
    }

    public static function eliminar($id) {
        try {
            $pdo = Conexion::conectar();
            $stmt = $pdo->prepare("DELETE FROM turnos WHERE IDturno = :id");
            $stmt->bindParam(':id', $id);
            return $stmt->execute();
        } catch (PDOException $e) { 
            throw new Exception("Error BD: " . $e->getMessage()); 
        }
    }
}
?>