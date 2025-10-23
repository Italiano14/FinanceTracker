// Sistema de almacenamiento de datos
class DataManager {
    constructor() {
        this.movimientos = JSON.parse(localStorage.getItem('financeTrackerMovimientos')) || [];
        this.categorias = JSON.parse(localStorage.getItem('financeTrackerCategorias')) || this.getDefaultCategories();
    }

    getDefaultCategories() {
        return [
            { id: '1', nombre: 'Salario', tipo: 'ingreso', usuarioId: 'system' },
            { id: '2', nombre: 'Freelance', tipo: 'ingreso', usuarioId: 'system' },
            { id: '3', nombre: 'Alimentación', tipo: 'gasto', usuarioId: 'system' },
            { id: '4', nombre: 'Transporte', tipo: 'gasto', usuarioId: 'system' },
            { id: '5', nombre: 'Vivienda', tipo: 'gasto', usuarioId: 'system' },
            { id: '6', nombre: 'Entretenimiento', tipo: 'gasto', usuarioId: 'system' },
            { id: '7', nombre: 'Salud', tipo: 'gasto', usuarioId: 'system' },
            { id: '8', nombre: 'Educación', tipo: 'gasto', usuarioId: 'system' }
        ];
    }

    // Movimientos
    agregarMovimiento(movimiento) {
        const nuevoMovimiento = {
            id: Date.now().toString(),
            usuarioId: authManager.getCurrentUser().id,
            ...movimiento,
            fecha: movimiento.fecha || new Date().toISOString().split('T')[0],
            creadoEn: new Date().toISOString()
        };
        
        this.movimientos.push(nuevoMovimiento);
        this.guardarMovimientos();
        return nuevoMovimiento;
    }

    obtenerMovimientos(usuarioId) {
        return this.movimientos.filter(m => m.usuarioId === usuarioId)
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    obtenerMovimientosDelMes(usuarioId) {
        const ahora = new Date();
        const primerDiaMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        
        return this.obtenerMovimientos(usuarioId).filter(m => 
            new Date(m.fecha) >= primerDiaMes
        );
    }

    eliminarMovimiento(id) {
        this.movimientos = this.movimientos.filter(m => m.id !== id);
        this.guardarMovimientos();
    }

    // Categorías
    agregarCategoria(categoria) {
        const nuevaCategoria = {
            id: Date.now().toString(),
            usuarioId: authManager.getCurrentUser().id,
            ...categoria
        };
        
        this.categorias.push(nuevaCategoria);
        this.guardarCategorias();
        return nuevaCategoria;
    }

    obtenerCategorias(usuarioId) {
        const categoriasSistema = this.categorias.filter(c => c.usuarioId === 'system');
        const categoriasUsuario = this.categorias.filter(c => c.usuarioId === usuarioId);
        return [...categoriasSistema, ...categoriasUsuario];
    }

    eliminarCategoria(id) {
        this.categorias = this.categorias.filter(c => c.id !== id);
        this.guardarCategorias();
    }

    // Cálculos financieros
    calcularTotalesDelMes(usuarioId) {
        const movimientos = this.obtenerMovimientosDelMes(usuarioId);
        
        const totalIngresos = movimientos
            .filter(m => this.obtenerCategoria(m.categoriaId)?.tipo === 'ingreso')
            .reduce((sum, m) => sum + parseFloat(m.monto), 0);

        const totalGastos = movimientos
            .filter(m => this.obtenerCategoria(m.categoriaId)?.tipo === 'gasto')
            .reduce((sum, m) => sum + parseFloat(m.monto), 0);

        return {
            ingresos: totalIngresos,
            gastos: totalGastos,
            balance: totalIngresos - totalGastos
        };
    }

    obtenerCategoria(categoriaId) {
        return this.categorias.find(c => c.id === categoriaId);
    }

    // Persistencia
    guardarMovimientos() {
        localStorage.setItem('financeTrackerMovimientos', JSON.stringify(this.movimientos));
    }

    guardarCategorias() {
        localStorage.setItem('financeTrackerCategorias', JSON.stringify(this.categorias));
    }
}

// Instancia global del administrador de datos
const dataManager = new DataManager();