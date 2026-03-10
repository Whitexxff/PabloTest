<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$pagina_actual = basename($_SERVER['PHP_SELF']);

$nombre_usuario = $_SESSION['nombre_usuario'] ?? $_SESSION['usuario'] ?? $_SESSION['nombre'] ?? 'Usuario';
$rol_usuario = $_SESSION['rol'] ?? 'Operador';
?>

<aside class="sidebar-yb bg-white shadow-sm d-flex flex-column h-100" id="sidebarMenu">

    <div class="sidebar-profile text-center py-4 border-bottom">
        <i class="bi bi-person-circle" style="font-size: 5.5rem; color: #da291c; line-height: 1;"></i>
        <h5 class="fw-bold mt-3 mb-0 text-black text-capitalize"><?php echo htmlspecialchars($nombre_usuario); ?></h5>
        <small class="text-muted text-capitalize"><?php echo htmlspecialchars($rol_usuario); ?></small>
    </div>

    <nav class="sidebar-nav flex-grow-1 mt-2 overflow-auto">
        <ul class="nav flex-column mb-0 w-100">

            <li class="nav-item w-100">
                <a href="VistaInicio.php"
                    class="nav-link-yb <?php echo ($pagina_actual == 'VistaInicio.php') ? 'active' : ''; ?>">
                    <i class="bi bi-house-door"></i> Inicio
                </a>
            </li>

            <li class="nav-item w-100">
                <a href="VistaAsistencia.php"
                    class="nav-link-yb <?php echo ($pagina_actual == 'VistaAsistencia.php') ? 'active' : ''; ?>">
                    <i class="bi bi-clock-history"></i> Control Asistencia
                </a>
            </li>

            <li class="nav-item w-100">
                <a href="VistaEnrolar.php"
                    class="nav-link-yb <?php echo ($pagina_actual == 'VistaFuncionarios.php' || $pagina_actual == 'VistaEnrolar.php') ? 'active' : ''; ?>">
                    <i class="bi bi-people"></i> Enrolar
                </a>
            </li>

            <li class="nav-item w-100">
                <a href="VistaTurno.php"
                    class="nav-link-yb <?php echo ($pagina_actual == 'VistaTurno.php') ? 'active' : ''; ?>">
                    <i class="bi bi-calendar-check"></i> Turnos
                </a>
            </li>

            <li class="nav-item w-100">
                <a href="VistaSecciones.php"
                    class="nav-link-yb <?php echo ($pagina_actual == 'VistaSecciones.php') ? 'active' : ''; ?>">
                    <i class="bi bi-building"></i> Secciones
                </a>
            </li>

            <?php if (strtolower($rol_usuario) === 'superadmin' || strtolower($rol_usuario) === 'administrador'): ?>
                <li class="nav-item w-100">
                    <a href="VistaUsuario.php"
                        class="nav-link-yb <?php echo ($pagina_actual == 'VistaUsuario.php') ? 'active' : ''; ?>">
                        <i class="bi bi-person-badge"></i> Usuarios
                    </a>
                </li>
                <li class="nav-item w-100">
                    <a href="#" class="nav-link-yb" data-bs-toggle="modal" data-bs-target="#modalMigracion">
                        <i class="bi bi-database-fill-up"></i> Importacion/Exportacion CSV
                    </a>
                </li>
            <?php endif; ?>

            <li class="nav-item w-100">
                <a href="VistaEscaner.php"
                    class="nav-link-yb <?php echo ($pagina_actual == 'VistaEscaner.php') ? 'active' : ''; ?>">
                    <i class="bi bi-upc-scan"></i> Escáner
                </a>
            </li>

        </ul>
    </nav>

    <div class="sidebar-footer p-4 border-top">
        <a href="../../controller/login_controller.php?action=logout" class="btn-logout-yb">
            <i class="bi bi-box-arrow-left"></i> Cerrar Sesión
        </a>
    </div>
</aside>