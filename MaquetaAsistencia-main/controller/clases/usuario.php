<?php
require_once __DIR__ . '/../../config/conexion.php';

class Usuario {
    
    /* =========================================================================
       1. FUNCIÓN DE LOGIN (Arreglada para tus columnas exactas)
       ========================================================================= */
    public static function validarLogin($login, $password) {
        try {
            $pdo = Conexion::conectar();
            // Usamos AS para engañar al sistema y que reciba los nombres que espera
            $sql = "SELECT IDusuario AS id, nombre_usuario AS nombre, nombre_usuario AS login, password_hash AS password, Rol AS rol 
                    FROM usuarios 
                    WHERE nombre_usuario = :log";
            
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':log', $login);
            $stmt->execute();
            
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

            // Quitamos lo del "estado" porque tu base de datos no tiene esa columna
            if ($usuario) {
                // Verifica la clave (encriptada o en texto plano)
                if (password_verify($password, $usuario['password']) || $password === $usuario['password']) {
                    unset($usuario['password']); // Borramos la clave por seguridad
                    return $usuario; 
                }
            }
            return false; 
        } catch (PDOException $e) {
            throw new Exception("Error BD: " . $e->getMessage());
        }
    }

    /* =========================================================================
       2. FUNCIONES DEL CRUD (Para el Superadmin - Gestión de Usuarios)
       ========================================================================= */
    public static function obtenerTodos() {
        try {
            $pdo = Conexion::conectar();
            $sql = "SELECT IDusuario AS id, nombre_usuario AS nombre, nombre_usuario AS login, Rol AS rol, 'Activo' AS estado 
                    FROM usuarios 
                    ORDER BY nombre_usuario ASC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Error BD: " . $e->getMessage());
        }
    }

    public static function crear($nombre, $login, $password, $rol, $estado) {
        try {
            $pdo = Conexion::conectar();
            $hash = password_hash($password, PASSWORD_DEFAULT);
            $sql = "INSERT INTO usuarios (nombre_usuario, password_hash, Rol) VALUES (:log, :pass, :rol)";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':log', $login); 
            $stmt->bindParam(':pass', $hash);
            $stmt->bindParam(':rol', $rol);   
            return $stmt->execute();
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) throw new Exception("El nombre de usuario ya existe.");
            throw new Exception("Error BD: " . $e->getMessage());
        }
    }

    public static function actualizar($id, $nombre, $login, $password, $rol, $estado) {
        try {
            $pdo = Conexion::conectar();
            if (empty($password)) {
                $sql = "UPDATE usuarios SET nombre_usuario = :log, Rol = :rol WHERE IDusuario = :id";
                $stmt = $pdo->prepare($sql);
            } else {
                $hash = password_hash($password, PASSWORD_DEFAULT);
                $sql = "UPDATE usuarios SET nombre_usuario = :log, password_hash = :pass, Rol = :rol WHERE IDusuario = :id";
                $stmt = $pdo->prepare($sql);
                $stmt->bindParam(':pass', $hash);
            }
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':log', $login);
            $stmt->bindParam(':rol', $rol);
            return $stmt->execute();
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) throw new Exception("El nombre de usuario ya está en uso.");
            throw new Exception("Error BD: " . $e->getMessage());
        }
    }

    public static function eliminar($id) {
        try {
            $pdo = Conexion::conectar();
            $stmt = $pdo->prepare("DELETE FROM usuarios WHERE IDusuario = :id");
            $stmt->bindParam(':id', $id);
            return $stmt->execute();
        } catch (PDOException $e) {
            throw new Exception("Error BD: " . $e->getMessage());
        }
    }
}
?>