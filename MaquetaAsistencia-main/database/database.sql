SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS reportes_historicos;
DROP TABLE IF EXISTS ausencia_permiso;
DROP TABLE IF EXISTS asistencia;
DROP TABLE IF EXISTS funcionarios;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS turnos;
DROP TABLE IF EXISTS secciones;

CREATE TABLE secciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE turnos (
    IDturno INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    hora_entrada TIME NOT NULL,
    hora_salida TIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE usuarios (
    IDusuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    Rol VARCHAR(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO usuarios (nombre_usuario, password_hash, Rol) 
VALUES ('pablito', 'pablitopro', 'superadmin');

-- TABLA FUNCIONARIOS ACTUALIZADA (Con codigo_tarjeta y tipo_contrato)
CREATE TABLE funcionarios (
    rut VARCHAR(20) PRIMARY KEY, 
    codigo_tarjeta VARCHAR(50) NULL UNIQUE, -- Aquí está el código del escáner
    nombre VARCHAR(50) DEFAULT("Por enrolar"),
    apellidoP VARCHAR(50) DEFAULT("Por enrolar"),
    apellidoM VARCHAR(50) DEFAULT("Por enrolar"),
    IDseccion INT,
    IDturno INT,
    tipo_contrato ENUM('Estatuto Administrativo', 'Codigo del Trabajo') DEFAULT 'Estatuto Administrativo',
    estado INT DEFAULT 1,
    FOREIGN KEY (IDseccion) REFERENCES secciones(id) ON DELETE SET NULL,
    FOREIGN KEY (IDturno) REFERENCES turnos(IDturno) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

create table funcionarios_enrolar(
    id_fn_enrolar INT AUTO_INCREMENT PRIMARY KEY,
    rut VARCHAR(20) NOT NULL
);

CREATE TABLE asistencia (
    IDmarca INT AUTO_INCREMENT PRIMARY KEY,
    rut_funcionario VARCHAR(20) NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    tipo_marca ENUM('entrada', 'salida') NOT NULL,
    foto_seguridad LONGTEXT NULL,
    FOREIGN KEY (rut_funcionario) REFERENCES funcionarios(rut) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE ausencia_permiso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rut_funcionario VARCHAR(20) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    fechaInicio DATE NOT NULL,
    fechaFIN DATE NOT NULL,
    observacion TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reportes_historicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mes INT NOT NULL,
    anio INT NOT NULL,
    rut_funcionario VARCHAR(20) NOT NULL,
    horas_ordinarias TIME DEFAULT '00:00:00',
    total_extras_diurnas TIME DEFAULT '00:00:00',
    total_extras_nocturnas TIME DEFAULT '00:00:00',
    total_atrasos TIME DEFAULT '00:00:00',
    fecha_generacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rut_funcionario) REFERENCES funcionarios(rut) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELIMITER $$
CREATE PROCEDURE sp_crear_plantilla_mensual()
BEGIN
    DECLARE v_mes_actual INT;
    DECLARE v_anio_actual INT;
    SET v_mes_actual = MONTH(CURRENT_DATE());
    SET v_anio_actual = YEAR(CURRENT_DATE());

    INSERT INTO reportes_historicos (mes, anio, rut_funcionario)
    SELECT v_mes_actual, v_anio_actual, rut
    FROM funcionarios 
    WHERE estado = 1
    AND NOT EXISTS (
        SELECT 1 FROM reportes_historicos 
        WHERE mes = v_mes_actual AND anio = v_anio_actual AND rut_funcionario = funcionarios.rut
    );
END $$
DELIMITER ;

SET GLOBAL event_scheduler = ON;
DROP EVENT IF EXISTS ev_apertura_mes;

DELIMITER $$
CREATE EVENT ev_apertura_mes
ON SCHEDULE EVERY 1 MONTH STARTS '2026-04-01 00:01:00'
DO BEGIN
    CALL sp_crear_plantilla_mensual();
END $$
DELIMITER ;

SET FOREIGN_KEY_CHECKS = 1;