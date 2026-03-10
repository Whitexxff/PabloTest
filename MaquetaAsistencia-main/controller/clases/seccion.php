<?php
require_once __DIR__ . '/../../config/conexion.php';

class Seccion {
    public static function obtenerTodas() {
        try {
            $pdo = Conexion::conectar();
            $stmt = $pdo->prepare("SELECT id, nombre FROM secciones ORDER BY nombre ASC");
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Error al obtener secciones: " . $e->getMessage());
        }
    }

    public static function crear($nombre) {
        try {
            $pdo = Conexion::conectar();
            $stmt = $pdo->prepare("INSERT INTO secciones (nombre) VALUES (:nom)");
            $stmt->bindParam(':nom', $nombre);
            return $stmt->execute();
        } catch (PDOException $e) {
            throw new Exception("Error al crear la sección: " . $e->getMessage());
        }
    }

    public static function actualizar($id, $nombre) {
        try {
            $pdo = Conexion::conectar();
            $stmt = $pdo->prepare("UPDATE secciones SET nombre = :nom WHERE id = :id");
            $stmt->bindParam(':nom', $nombre);
            $stmt->bindParam(':id', $id);
            return $stmt->execute();
        } catch (PDOException $e) {
            throw new Exception("Error al actualizar la sección: " . $e->getMessage());
        }
    }

    public static function eliminar($id) {
        try {
            $pdo = Conexion::conectar();
            $stmt = $pdo->prepare("DELETE FROM secciones WHERE id = :id");
            $stmt->bindParam(':id', $id);
            return $stmt->execute();
        } catch (PDOException $e) {
            // Si intentan borrar una sección que ya tiene funcionarios asignados
            if ($e->getCode() == 23000) {
                throw new Exception("No puedes eliminar esta sección porque hay funcionarios asignados a ella.");
            }
            throw new Exception("Error al eliminar: " . $e->getMessage());
        }
    }
}
?>