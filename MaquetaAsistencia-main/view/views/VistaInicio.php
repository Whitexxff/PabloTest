<?php include '../includes/header.php'; ?>

<div class="header-seccion">
    <div>
        <h1>Panel de Inicio</h1>
        <p>Resumen general del Sistema de Control de Asistencia.</p>
    </div>
    <div class="text-end text-white fw-bold fs-5">
        <i class="bi bi-calendar3 me-2"></i> Panel Activo
    </div>
</div>

<div class="row g-4 mb-5">
    
    <div class="col-12 col-md-6 col-xl-3">
        <div class="card border-0 shadow-sm h-100 card-dash" style="border-left: 8px solid var(--yb-red) !important;">
            <div class="card-body d-flex align-items-center">
                <div class="icon-dash bg-danger bg-opacity-10 text-danger rounded-circle d-flex justify-content-center align-items-center me-4">
                    <i class="bi bi-people-fill"></i>
                </div>
                <div>
                    <h6 class="text-muted fw-bold mb-1 text-uppercase">Total Funcionarios</h6>
                    <h2 class="mb-0 fw-bolder text-dark" id="dash-total-func">
                        <span class="spinner-border spinner-border-sm text-danger" role="status" aria-hidden="true"></span>
                    </h2>
                </div>
            </div>
        </div>
    </div>

    <div class="col-12 col-md-6 col-xl-3">
        <div class="card border-0 shadow-sm h-100 card-dash" style="border-left: 8px solid #198754 !important;">
            <div class="card-body d-flex align-items-center">
                <div class="icon-dash bg-success bg-opacity-10 text-success rounded-circle d-flex justify-content-center align-items-center me-4">
                    <i class="bi bi-person-check-fill"></i>
                </div>
                <div>
                    <h6 class="text-muted fw-bold mb-1 text-uppercase">Presentes Hoy</h6>
                    <h2 class="mb-0 fw-bolder text-dark" id="dash-presentes">
                        <span class="spinner-border spinner-border-sm text-success" role="status" aria-hidden="true"></span>
                    </h2>
                </div>
            </div>
        </div>
    </div>

    <div class="col-12 col-md-6 col-xl-3">
        <div class="card border-0 shadow-sm h-100 card-dash" style="border-left: 8px solid #dc3545 !important;">
            <div class="card-body d-flex align-items-center">
                <div class="icon-dash bg-danger bg-opacity-10 text-danger rounded-circle d-flex justify-content-center align-items-center me-4">
                    <i class="bi bi-person-x-fill"></i>
                </div>
                <div>
                    <h6 class="text-muted fw-bold mb-1 text-uppercase">Atrasos Hoy</h6>
                    <h2 class="mb-0 fw-bolder text-dark" id="dash-atrasos">
                        <span class="spinner-border spinner-border-sm text-danger" role="status" aria-hidden="true"></span>
                    </h2>
                </div>
            </div>
        </div>
    </div>

    <div class="col-12 col-md-6 col-xl-3">
        <div class="card border-0 shadow-sm h-100 card-dash" style="border-left: 8px solid #ffc107 !important;">
            <div class="card-body d-flex align-items-center">
                <div class="icon-dash bg-warning bg-opacity-10 text-warning rounded-circle d-flex justify-content-center align-items-center me-4">
                    <i class="bi bi-file-earmark-medical-fill"></i>
                </div>
                <div>
                    <h6 class="text-muted fw-bold mb-1 text-uppercase">Licencias Activas</h6>
                    <h2 class="mb-0 fw-bolder text-dark" id="dash-licencias">
                        <span class="spinner-border spinner-border-sm text-warning" role="status" aria-hidden="true"></span>
                    </h2>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-12">
        <div class="card border-0 shadow-sm p-4 h-100 border-top-danger-yb">
            <h3 class="text-black fw-bold mb-4"><i class="bi bi-bell-fill me-2 text-danger-yb"></i> Avisos del Sistema</h3>
            
            <ul class="list-group list-group-flush fs-5" id="lista-avisos">
                
                <div class="text-center py-4 text-muted">
                    <div class="spinner-border spinner-border-sm text-secondary me-2" role="status"></div>
                    <span class="fs-5">Cargando avisos del sistema...</span>
                </div>

            </ul>

        </div>
    </div>
</div>

<?php include '../includes/footer.php'; ?>