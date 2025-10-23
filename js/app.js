// Funciones principales de la aplicación
function loadDashboardData() {
    if (!authManager.isLoggedIn()) return;

    const usuarioId = authManager.getCurrentUser().id;
    
    // Cargar totales
    const totales = dataManager.calcularTotalesDelMes(usuarioId);
    document.getElementById('totalIngresos').textContent = `$${totales.ingresos.toFixed(2)}`;
    document.getElementById('totalGastos').textContent = `$${totales.gastos.toFixed(2)}`;
    document.getElementById('balance').textContent = `$${totales.balance.toFixed(2)}`;

    // Cargar últimos movimientos
    const movimientos = dataManager.obtenerMovimientosDelMes(usuarioId).slice(0, 10);
    displayMovimientos(movimientos);
}

function displayMovimientos(movimientos) {
    const container = document.getElementById('movimientosList');
    
    if (movimientos.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-receipt fa-3x text-muted mb-3"></i>
                <p class="text-muted">No hay movimientos registrados este mes.</p>
                <a href="agregar.html" class="btn btn-primary">Agregar primer movimiento</a>
            </div>
        `;
        return;
    }

    const movimientosHTML = movimientos.map(movimiento => {
        const categoria = dataManager.obtenerCategoria(movimiento.categoriaId);
        const tipo = categoria?.tipo || 'gasto';
        const colorClase = tipo === 'ingreso' ? 'text-success' : 'text-danger';
        const icono = tipo === 'ingreso' ? 'fa-arrow-up' : 'fa-arrow-down';

        return `
            <tr>
                <td>${formatDate(movimiento.fecha)}</td>
                <td>${movimiento.descripcion}</td>
                <td>
                    <span class="badge bg-${tipo === 'ingreso' ? 'success' : 'danger'}">
                        ${categoria?.nombre || 'Sin categoría'}
                    </span>
                </td>
                <td class="text-end ${colorClase}">
                    <i class="fas ${icono} me-1"></i>
                    $${parseFloat(movimiento.monto).toFixed(2)}
                </td>
            </tr>
        `;
    }).join('');

    container.innerHTML = `
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Descripción</th>
                    <th>Categoría</th>
                    <th class="text-end">Monto</th>
                </tr>
            </thead>
            <tbody>
                ${movimientosHTML}
            </tbody>
        </table>
    `;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
}

// Inicialización de formularios
document.addEventListener('DOMContentLoaded', function() {
    // Formulario de agregar movimiento
    const movimientoForm = document.getElementById('movimientoForm');
    if (movimientoForm) {
        // Cargar categorías en el select
        const categoriaSelect = document.getElementById('categoria');
        const usuarioId = authManager.getCurrentUser().id;
        const categorias = dataManager.obtenerCategorias(usuarioId);
        
        categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.id;
            option.textContent = `${categoria.nombre} (${categoria.tipo})`;
            categoriaSelect.appendChild(option);
        });

        movimientoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const movimiento = {
                monto: parseFloat(document.getElementById('monto').value),
                descripcion: document.getElementById('descripcion').value,
                categoriaId: document.getElementById('categoria').value,
                fecha: document.getElementById('fecha').value
            };

            dataManager.agregarMovimiento(movimiento);
            showAlert('Movimiento agregado correctamente', 'success');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        });
    }

    // Formulario de categorías
    const categoriaForm = document.getElementById('categoriaForm');
    if (categoriaForm) {
        loadCategorias();

        categoriaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const categoria = {
                nombre: document.getElementById('nombre').value,
                tipo: document.getElementById('tipo').value
            };

            dataManager.agregarCategoria(categoria);
            showAlert('Categoría agregada correctamente', 'success');
            categoriaForm.reset();
            loadCategorias();
        });
    }
});

function loadCategorias() {
    const categoriasContainer = document.getElementById('categoriasList');
    if (!categoriasContainer) return;

    const usuarioId = authManager.getCurrentUser().id;
    const categorias = dataManager.obtenerCategorias(usuarioId);

    if (categorias.length === 0) {
        categoriasContainer.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-tags fa-3x text-muted mb-3"></i>
                <p class="text-muted">No tienes categorías personalizadas.</p>
            </div>
        `;
        return;
    }

    const categoriasHTML = categorias.map(categoria => `
        <tr>
            <td>${categoria.nombre}</td>
            <td>
                <span class="badge bg-${categoria.tipo === 'ingreso' ? 'success' : 'danger'}">
                    ${categoria.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
                </span>
            </td>
            <td>
                ${categoria.usuarioId === 'system' ? 
                    '<span class="badge bg-secondary">Sistema</span>' : 
                    `<button class="btn btn-sm btn-danger" onclick="eliminarCategoria('${categoria.id}')">
                        <i class="fas fa-trash"></i>
                    </button>`
                }
            </td>
        </tr>
    `).join('');

    categoriasContainer.innerHTML = `
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${categoriasHTML}
            </tbody>
        </table>
    `;
}

function eliminarCategoria(id) {
    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
        dataManager.eliminarCategoria(id);
        loadCategorias();
        showAlert('Categoría eliminada correctamente', 'success');
    }
}