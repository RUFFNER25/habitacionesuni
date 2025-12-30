<script setup>
import { ref, onMounted } from "vue";

const habitaciones = ref([]);
const seleccionada = ref(null);

const error = ref("");
const cargando = ref(false);
const cargandoDetalle = ref(false);

const nombre = ref("");
const doc = ref("");
const alquilando = ref(false);

// ✅ En Kubernetes (con nginx proxy) usamos rutas relativas:
const API = ""; // o simplemente no usarlo, pero lo dejo para que tu código sea igual

async function cargarHabitaciones() {
  cargando.value = true;
  error.value = "";
  try {
    const res = await fetch(`${API}/api/habitaciones`);
    const json = await res.json();

    if (!res.ok || json.success === false) {
      throw new Error(json.message || "Error consultando API");
    }

    habitaciones.value = json.data;
  } catch (e) {
    error.value = e.message || String(e);
  } finally {
    cargando.value = false;
  }
}

async function verDetalle(id) {
  cargandoDetalle.value = true;
  error.value = "";
  try {
    const res = await fetch(`${API}/api/habitaciones/${id}`);
    const json = await res.json();

    if (!res.ok || json.success === false) {
      throw new Error(json.message || "Error consultando detalle");
    }

    seleccionada.value = json.data;

    // ✅ limpiar inputs al cambiar de habitación
    nombre.value = "";
    doc.value = "";
  } catch (e) {
    error.value = e.message || String(e);
  } finally {
    cargandoDetalle.value = false;
  }
}

async function alquilar() {
  if (!seleccionada.value) return;

  if (!nombre.value.trim() || !doc.value.trim()) {
    error.value = "Completa nombre y documento";
    return;
  }

  alquilando.value = true;
  error.value = "";

  try {
    const res = await fetch(`${API}/api/alquiler`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        habitacionId: seleccionada.value.id,
        estudianteNombre: nombre.value.trim(),
        estudianteDoc: doc.value.trim(),
      }),
    });

    const json = await res.json();
    if (!res.ok || json.success === false) {
      throw new Error(json.message || "No se pudo alquilar");
    }

    // limpiar y refrescar
    nombre.value = "";
    doc.value = "";
    seleccionada.value = null;

    await cargarHabitaciones(); // recarga lista (ya no saldrá la alquilada si el backend la marca como no disponible)
  } catch (e) {
    error.value = e.message || String(e);
  } finally {
    alquilando.value = false;
  }
}

function estadoTexto(h) {
  return h?.disponible == 1 ? "Disponible" : "No disponible";
}

onMounted(cargarHabitaciones);
</script>

<template>
  <div style="max-width: 980px; margin: 30px auto; font-family: Arial;">
    <h2 style="text-align:center;">🏠 Habitaciones (Frontend)</h2>

    <p v-if="error" style="color: red; text-align:center;">{{ error }}</p>
    <p v-if="cargando" style="text-align:center;">Cargando...</p>

    <div style="display:flex; gap: 24px; align-items:flex-start; margin-top: 18px;">
      <!-- LISTA -->
      <div style="flex: 1; border: 1px solid #333; border-radius: 12px; padding: 16px;">
        <h3 style="margin-top:0;">Lista</h3>

        <div v-if="!cargando && habitaciones.length === 0">
          No hay habitaciones.
        </div>

        <ul v-else style="padding-left: 18px;">
          <li v-for="h in habitaciones" :key="h.id" style="margin: 12px 0;">
            <b>{{ h.titulo }}</b> — S/ {{ h.precio }}
            <span style="margin-left: 10px;">
              ({{ estadoTexto(h) }})
            </span>

            <button style="margin-left: 12px;" @click="verDetalle(h.id)">
              Ver detalle
            </button>
          </li>
        </ul>

        <button @click="cargarHabitaciones" style="margin-top: 10px;">
          🔄 Recargar
        </button>
      </div>

      <!-- DETALLE -->
      <div style="flex: 1; border: 1px solid #333; border-radius: 12px; padding: 16px;">
        <h3 style="margin-top:0;">Detalle</h3>

        <p v-if="cargandoDetalle">Cargando detalle...</p>
        <p v-else-if="!seleccionada">Selecciona una habitación.</p>

        <div v-else>
          <p style="margin: 0 0 10px;">
            <b>{{ seleccionada.titulo }}</b>
          </p>

          <p style="margin: 0 0 6px;"><b>Ubicación:</b> {{ seleccionada.ubicacion }}</p>
          <p style="margin: 0 0 6px;"><b>Incluye:</b> {{ seleccionada.incluye }}</p>
          <p style="margin: 0 0 6px;"><b>Precio:</b> S/ {{ seleccionada.precio }}</p>
          <p style="margin: 0 0 10px;">
            <b>Estado:</b>
            <span :style="{ color: seleccionada.disponible == 1 ? 'lime' : 'red' }">
              {{ estadoTexto(seleccionada) }}
            </span>
          </p>

          <p style="margin: 0 0 10px;"><b>Descripción:</b> {{ seleccionada.descripcion }}</p>

          <img
            v-if="seleccionada.imagen_url"
            :src="seleccionada.imagen_url"
            alt="Imagen"
            style="width: 100%; max-height: 220px; object-fit: cover; border-radius: 12px;"
          />

          <hr style="margin: 16px 0;" />
          <h3>Alquilar</h3>

          <input
            v-model="nombre"
            placeholder="Nombre del estudiante"
            style="width: 100%; padding: 10px; margin-bottom: 8px; border-radius: 8px;"
          />

          <input
            v-model="doc"
            placeholder="DNI / Código"
            style="width: 100%; padding: 10px; margin-bottom: 8px; border-radius: 8px;"
          />

          <button
            @click="alquilar"
            :disabled="alquilando || seleccionada.disponible != 1"
            style="width: 100%; padding: 10px; border-radius: 8px;"
          >
            {{ alquilando ? "Alquilando..." : "Alquilar esta habitación" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
