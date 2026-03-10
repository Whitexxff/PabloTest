</main> </div> 

<div class="modal fade" id="modalMigracion" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-top-danger-yb">
            <div class="modal-header border-0 pb-0">
                <h5 class="modal-title fw-bold text-black">
                    <i class="bi bi-database-fill-up me-2 text-danger-yb"></i>Migración de Datos (CSV)
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4 p-md-5">
                <div class="row g-4">
                    
                    <div class="col-12 col-md-6 border-end-md pe-md-4">
                        <div class="text-center mb-4">
                            <i class="bi bi-cloud-upload text-danger-yb mb-2" style="font-size: 3.5rem;"></i>
                            <h5 class="fw-bold mt-2">Importar Asistencia</h5>
                            <p class="text-muted small">Sube el archivo antiguo. El sistema limpiará los RUTs y deducirá Entradas/Salidas automáticamente.</p>
                        </div>
                        <form id="form-importar-csv">
                            <input class="form-control mb-3 shadow-sm" type="file" id="archivo_csv" accept=".csv" required>
                            <button type="submit" class="btn btn-danger w-100 fw-bold py-2 shadow-sm" id="btn-importar">
                                <i class="bi bi-database-add me-2"></i> Procesar Archivo
                            </button>
                        </form>
                    </div>

                    <div class="col-12 col-md-6 ps-md-4 d-flex flex-column">
                        <div class="text-center mb-4">
                            <i class="bi bi-file-earmark-spreadsheet text-blue-yb mb-2" style="color: var(--yb-blue); font-size: 3.5rem;"></i>
                            <h5 class="fw-bold mt-2">Exportar Asistencia</h5>
                            <p class="text-muted small">Descarga la BD actual en CSV para respaldos o auditorías de Contraloría.</p>
                        </div>
                        <button type="button" class="btn btn-primary w-100 fw-bold py-2 shadow-sm mt-auto" style="background-color: var(--yb-blue); border-color: var(--yb-blue);" onclick="window.location.href='../../controller/migracion_controller.php?action=exportar'">
                            <i class="bi bi-download me-2"></i> Descargar Base de Datos
                        </button>
                    </div>

                </div>
            </div>
        </div>
    </div>
</div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../../model/api.js"></script>
    <script src="../../assets/js/script.js?v=2.0"></script>
</body>
</html>