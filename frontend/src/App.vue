<script setup>
import { ref, onMounted, computed } from "vue";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

const habitaciones = ref([]);
const seleccionada = ref(null);

const error = ref("");
const cargando = ref(false);
const cargandoDetalle = ref(false);

const nombre = ref("");
const doc = ref("");
const alquilando = ref(false);

// UI extras
const busqueda = ref("");
const soloDisponibles = ref(false);
const orden = ref("precio_asc"); // precio_asc | precio_desc

const habitacionesFiltradas = computed(() => {
  let list = [...habitaciones.value];

  if (soloDisponibles.value) {
    list = list.filter(h => h.disponible == 1);
  }

  if (busqueda.value.trim()) {
    const q = busqueda.value.toLowerCase();
    list = list.filter(h =>
      (h.titulo || "").toLowerCase().includes(q) ||
      (h.ubicacion || "").toLowerCase().includes(q)
    );
  }

  if (orden.value === "precio_asc") {
    list.sort((a, b) => Number(a.precio) - Number(b.precio));
  } else {
    list.sort((a, b) => Number(b.precio) - Number(a.precio));
  }

  return list;
});

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

    nombre.value = "";
    doc.value = "";
    seleccionada.value = null;

    await cargarHabitaciones();
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
  <div class="page">
    <header class="header">
      <h1>🏠 Habitaciones (Frontend)</h1>
      <p class="sub">Listado, detalle y alquiler consumiendo la API</p>
    </header>

    <div v-if="error" class="alert">{{ error }}</div>

    <!-- CONTROLES -->
    <div class="controls">
      <input
        v-model="busqueda"
        class="input"
        placeholder="Buscar por título o ubicación..."
      />

      <label class="check">
        <input type="checkbox" v-model="soloDisponibles" />
        Solo disponibles
      </label>

      <select v-model="orden" class="select">
        <option value="precio_asc">Precio: menor a mayor</option>
        <option value="precio_desc">Precio: mayor a menor</option>
      </select>

      <button class="btn" @click="cargarHabitaciones">🔄 Recargar</button>
    </div>

    <div class="grid">
      <!-- LISTA -->
      <section class="card">
        <div class="cardTitle">
          <h2>Lista</h2>
          <span class="pill">{{ habitacionesFiltradas.length }} items</span>
        </div>

        <p v-if="cargando" class="muted">Cargando...</p>

        <div v-else-if="habitacionesFiltradas.length === 0" class="muted">
          No hay habitaciones con ese filtro.
        </div>

        <div v-else class="list">
          <button
            v-for="h in habitacionesFiltradas"
            :key="h.id"
            class="item"
            @click="verDetalle(h.id)"
          >
            <img
              class="thumb"
              :src="h.imagen_url || 'https://via.placeholder.com/80x60?text=IMG'"
              alt="img"
            />
            <div class="info">
              <div class="top">
                <strong class="title">{{ h.titulo }}</strong>
                <span class="price">S/ {{ h.precio }}</span>
              </div>
              <div class="bottom">
                <span class="loc">{{ h.ubicacion }}</span>
                <span class="badge" :class="h.disponible == 1 ? 'ok' : 'no'">
                  {{ estadoTexto(h) }}
                </span>
              </div>
            </div>
          </button>
        </div>
      </section>

      <!-- DETALLE -->
      <section class="card">
        <div class="cardTitle">
          <h2>Detalle</h2>
        </div>

        <p v-if="cargandoDetalle" class="muted">Cargando detalle...</p>
        <p v-else-if="!seleccionada" class="muted">Selecciona una habitación.</p>

        <div v-else class="detail">
          <img
            class="hero"
            :src="seleccionada.imagen_url || 'https://via.placeholder.com/600x240?text=IMG'"
            alt="img"
          />

          <div class="detailHead">
            <h3>{{ seleccionada.titulo }}</h3>
            <span class="badge" :class="seleccionada.disponible == 1 ? 'ok' : 'no'">
              {{ estadoTexto(seleccionada) }}
            </span>
          </div>

          <p><b>Ubicación:</b> {{ seleccionada.ubicacion }}</p>
          <p><b>Incluye:</b> {{ seleccionada.incluye }}</p>
          <p><b>Precio:</b> S/ {{ seleccionada.precio }}</p>
          <p><b>Descripción:</b> {{ seleccionada.descripcion }}</p>

          <hr class="hr" />

          <h3>Alquilar</h3>

          <input v-model="nombre" class="input" placeholder="Nombre del estudiante" />
          <input v-model="doc" class="input" placeholder="DNI / Código" />

          <button
            class="btn primary"
            @click="alquilar"
            :disabled="alquilando || seleccionada.disponible != 1"
          >
            {{ alquilando ? "Alquilando..." : "Alquilar esta habitación" }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style>
.page {
  max-width: 1050px;
  margin: 30px auto;
  padding: 0 16px;
  font-family: Arial, sans-serif;
  color: #eee;
}
.header {
  text-align: center;
  margin-bottom: 18px;
}
.header h1 {
  margin: 0;
  font-size: 28px;
}
.sub {
  margin: 6px 0 0;
  opacity: 0.8;
}
.alert {
  background: rgba(255, 60, 60, 0.15);
  border: 1px solid rgba(255, 60, 60, 0.35);
  padding: 10px 12px;
  border-radius: 10px;
  margin: 12px 0;
}
.controls {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 10px;
  align-items: center;
  margin-bottom: 16px;
}
.grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 16px;
}
.card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 14px;
  backdrop-filter: blur(6px);
}
.cardTitle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.pill {
  font-size: 12px;
  opacity: 0.9;
  border: 1px solid rgba(255,255,255,0.15);
  padding: 4px 8px;
  border-radius: 999px;
}
.muted {
  opacity: 0.75;
}
.input, .select {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(0,0,0,0.25);
  color: #eee;
}
.select {
  width: auto;
}
.check {
  display: flex;
  gap: 8px;
  align-items: center;
  opacity: 0.9;
}
.btn {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.16);
  background: rgba(255,255,255,0.06);
  color: #eee;
  cursor: pointer;
}
.btn:hover {
  background: rgba(255,255,255,0.10);
}
.btn.primary {
  width: 100%;
  margin-top: 10px;
  background: rgba(60, 140, 255, 0.22);
  border-color: rgba(60, 140, 255, 0.40);
}
.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.item {
  display: grid;
  grid-template-columns: 82px 1fr;
  gap: 10px;
  padding: 10px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(0,0,0,0.18);
  cursor: pointer;
  text-align: left;
}
.item:hover {
  background: rgba(0,0,0,0.28);
}
.thumb {
  width: 82px;
  height: 62px;
  object-fit: cover;
  border-radius: 12px;
}
.top {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}
.title {
  font-size: 14px;
}
.price {
  font-weight: 700;
}
.bottom {
  margin-top: 6px;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  opacity: 0.9;
}
.loc {
  font-size: 12px;
  opacity: 0.85;
}
.badge {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.14);
}
.badge.ok {
  background: rgba(0, 255, 120, 0.14);
  border-color: rgba(0, 255, 120, 0.35);
}
.badge.no {
  background: rgba(255, 70, 70, 0.14);
  border-color: rgba(255, 70, 70, 0.35);
}
.hero {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 14px;
  margin-bottom: 10px;
}
.detailHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.hr {
  border: 0;
  border-top: 1px solid rgba(255,255,255,0.10);
  margin: 14px 0;
}
@media (max-width: 900px) {
  .grid { grid-template-columns: 1fr; }
  .controls { grid-template-columns: 1fr; }
  .select { width: 100%; }
}
</style>
