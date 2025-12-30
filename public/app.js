const API_BASE_URL = '/api/habitaciones';

// Elementos del DOM
const habitacionesContainer = document.getElementById('habitaciones-container');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const closeModal = document.querySelector('.close');

// Cargar habitaciones al iniciar
document.addEventListener('DOMContentLoaded', () => {
    cargarHabitaciones();
    
    // Cerrar modal al hacer clic en la X
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Función para cargar todas las habitaciones
async function cargarHabitaciones() {
    try {
        loading.style.display = 'block';
        errorDiv.style.display = 'none';
        habitacionesContainer.innerHTML = '';

        const response = await fetch(API_BASE_URL);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al cargar las habitaciones');
        }

        if (data.success && data.data.length > 0) {
            mostrarHabitaciones(data.data);
        } else {
            habitacionesContainer.innerHTML = '<p style="text-align: center; padding: 2rem;">No hay habitaciones disponibles en este momento.</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        errorDiv.textContent = `Error: ${error.message}`;
        errorDiv.style.display = 'block';
    } finally {
        loading.style.display = 'none';
    }
}

// Función para mostrar las habitaciones en cards
function mostrarHabitaciones(habitaciones) {
    habitacionesContainer.innerHTML = habitaciones.map(habitacion => `
        <div class="habitacion-card" onclick="verDetalles(${habitacion.id})">
            <img src="${habitacion.imagen_url || 'https://via.placeholder.com/400x200?text=Habitacion'}" 
                 alt="${habitacion.titulo}" 
                 class="habitacion-imagen"
                 onerror="this.src='https://via.placeholder.com/400x200?text=Habitacion'">
            <div class="habitacion-info">
                <h2 class="habitacion-titulo">${habitacion.titulo}</h2>
                <p class="habitacion-ubicacion">📍 ${habitacion.ubicacion}</p>
                <p class="habitacion-precio">$${habitacion.precio.toFixed(2)}/mes</p>
                <p class="habitacion-descripcion">${habitacion.descripcion}</p>
                <button class="btn-ver-detalles" onclick="event.stopPropagation(); verDetalles(${habitacion.id})">
                    Ver Detalles
                </button>
            </div>
        </div>
    `).join('');
}

// Función para ver detalles de una habitación
async function verDetalles(id) {
    try {
        loading.style.display = 'block';
        const response = await fetch(`${API_BASE_URL}/${id}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al cargar los detalles');
        }

        if (data.success && data.data) {
            mostrarModal(data.data);
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`Error al cargar los detalles: ${error.message}`);
    } finally {
        loading.style.display = 'none';
    }
}

// Función para mostrar el modal con los detalles
function mostrarModal(habitacion) {
    const incluyeItems = habitacion.incluye.split(',').map(item => item.trim());
    
    modalBody.innerHTML = `
        <img src="${habitacion.imagen_url || 'https://via.placeholder.com/700x400?text=Habitacion'}" 
             alt="${habitacion.titulo}" 
             class="modal-imagen"
             onerror="this.src='https://via.placeholder.com/700x400?text=Habitacion'">
        <h2 class="modal-titulo">${habitacion.titulo}</h2>
        <p class="modal-ubicacion">📍 ${habitacion.ubicacion}</p>
        <p class="modal-precio">$${habitacion.precio.toFixed(2)}/mes</p>
        <p class="modal-descripcion">${habitacion.descripcion}</p>
        <div class="modal-incluye">
            <h3>¿Qué incluye?</h3>
            <ul>
                ${incluyeItems.map(item => `<li>${item}</li>`).join('')}
            </ul>
        </div>
    `;
    
    modal.style.display = 'block';
}

