<?php
require_once __DIR__ . '/../../config/conexion.php';

class Funcionario
{
    public static function obtenerTodos()
    {
        try {
            $pdo = Conexion::conectar();
            $sql = "SELECT f.rut, f.nombre, f.apellidoP, f.apellidoM, 
                           f.IDseccion, s.nombre AS nombre_seccion, 
                           f.IDturno, t.nombre AS nombre_turno, f.estado 
                    FROM funcionarios f
                    LEFT JOIN secciones s ON f.IDseccion = s.id
                    LEFT JOIN turnos t ON f.IDturno = t.IDturno
                    ORDER BY f.nombre ASC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Error al obtener funcionarios: " . $e->getMessage());
        }
    }

    public static function crear($rut, $nombre, $apellidoP, $apellidoM, $idSeccion, $idTurno, $codigo_tarjeta, $estado = 1)
    {
        try {
            $pdo = Conexion::conectar();
            $sql = "INSERT INTO funcionarios (rut, nombre, apellidoP, apellidoM, IDseccion, IDturno, codigo_tarjeta, estado) 
                    VALUES (:rut, :nom, :ap, :am, :seccion, :turno, :codigo, :est)";

            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':rut', $rut);
            $stmt->bindParam(':nom', $nombre);
            $stmt->bindParam(':ap', $apellidoP);
            $stmt->bindParam(':am', $apellidoM);
            $stmt->bindParam(':seccion', $idSeccion);
            $stmt->bindParam(':turno', $idTurno);
            $stmt->bindParam(':codigo', $codigo_tarjeta); // Se guarda el código
            $stmt->bindParam(':est', $estado);

            return $stmt->execute();
        } catch (PDOException $e) {
            $errorMsg = $e->getMessage();

            // Tus validaciones originales intactas
            if ($e->getCode() == 23000) {
                if (strpos($errorMsg, 'Duplicate entry') !== false) {
                    throw new Exception("Error: El RUT $rut ya está registrado en el sistema.");
                } elseif (strpos($errorMsg, 'foreign key constraint fails') !== false) {
                    if (strpos($errorMsg, 'IDseccion') !== false) {
                        throw new Exception("Error: La Sección seleccionada no existe en la base de datos.");
                    } elseif (strpos($errorMsg, 'IDturno') !== false) {
                        throw new Exception("Error: El Turno seleccionado no existe.");
                    } else {
                        throw new Exception("Error: Faltan datos referenciales en la base de datos.");
                    }
                }
            }
            throw new Exception("Error de base de datos: " . $errorMsg);
        }
    }

    public static function actualizar($rut_original, $rut_nuevo, $nombre, $apellidoP, $apellidoM, $id_seccion, $id_turno)
    {
        try {
            $pdo = Conexion::conectar();

            // Actualizamos todos los datos, incluyendo el RUT
            $sql = "UPDATE funcionarios 
                    SET rut = :rut_nuevo, 
                        nombre = :nombre, 
                        apellidoP = :apellidoP, 
                        apellidoM = :apellidoM, 
                        IDseccion = :id_seccion, 
                        IDturno = :id_turno 
                    WHERE rut = :rut_original";

            $stmt = $pdo->prepare($sql);

            $stmt->bindParam(':rut_nuevo', $rut_nuevo);
            $stmt->bindParam(':nombre', $nombre);
            $stmt->bindParam(':apellidoP', $apellidoP);
            $stmt->bindParam(':apellidoM', $apellidoM);
            $stmt->bindParam(':id_seccion', $id_seccion);
            $stmt->bindParam(':id_turno', $id_turno);
            $stmt->bindParam(':rut_original', $rut_original);

            return $stmt->execute();
        } catch (PDOException $e) {
            // Si hay un error, lo lanzamos para que el controlador lo capture
            throw new Exception("Error al actualizar la BD: " . $e->getMessage());
        }
    }

    public static function eliminar($rut)
    {
        try {
            $pdo = Conexion::conectar();
            $sql = "DELETE FROM funcionarios WHERE rut = :rut";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':rut', $rut);
            return $stmt->execute();
        } catch (PDOException $e) {
            throw new Exception("Error BD: " . $e->getMessage());
        }
    }
}
?>