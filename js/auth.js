// Sistema de autenticación simple usando localStorage
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('financeTrackerUsers')) || [];
        this.init();
    }

    init() {
        const savedUser = localStorage.getItem('financeTrackerCurrentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
    }

    register(username, password) {
        // Verificar si el usuario ya existe
        if (this.users.find(u => u.username === username)) {
            throw new Error('El usuario ya existe');
        }

        const newUser = {
            id: Date.now().toString(),
            username,
            password: btoa(password), // Encriptación básica
            createdAt: new Date().toISOString()
        };

        this.users.push(newUser);
        localStorage.setItem('financeTrackerUsers', JSON.stringify(this.users));
        
        return this.login(username, password);
    }

    login(username, password) {
        const user = this.users.find(u => 
            u.username === username && 
            u.password === btoa(password)
        );

        if (!user) {
            throw new Error('Usuario o contraseña incorrectos');
        }

        this.currentUser = { ...user, password: undefined };
        localStorage.setItem('financeTrackerCurrentUser', JSON.stringify(this.currentUser));
        
        return this.currentUser;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('financeTrackerCurrentUser');
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// Instancia global del administrador de autenticación
const authManager = new AuthManager();

// Funciones de utilidad para la autenticación
function isLoggedIn() {
    return authManager.isLoggedIn();
}

function getCurrentUser() {
    return authManager.getCurrentUser();
}

function logout() {
    authManager.logout();
    window.location.href = 'index.html';
}

// Manejar formularios de login y registro
document.addEventListener('DOMContentLoaded', function() {
    // Formulario de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                authManager.login(username, password);
                showAlert('¡Bienvenido!', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } catch (error) {
                showAlert(error.message, 'danger');
            }
        });
    }

    // Formulario de registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                showAlert('Las contraseñas no coinciden', 'danger');
                return;
            }

            try {
                authManager.register(username, password);
                showAlert('¡Cuenta creada exitosamente!', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } catch (error) {
                showAlert(error.message, 'danger');
            }
        });
    }
});

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    setTimeout(() => {
        if (alertDiv.parentElement) {
            alertDiv.remove();
        }
    }, 5000);
}