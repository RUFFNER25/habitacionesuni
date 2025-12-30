const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'habitaciones.db');

// Crear conexión a la base de datos
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite');
  }
});

// Inicializar la tabla de habitaciones
function initDatabase() {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS habitaciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        descripcion TEXT NOT NULL,
        precio REAL NOT NULL,
        incluye TEXT NOT NULL,
        ubicacion TEXT NOT NULL,
        disponible INTEGER DEFAULT 1,
        imagen_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Obtener todas las habitaciones
function getAllHabitaciones() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM habitaciones WHERE disponible = 1 ORDER BY precio ASC', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Obtener una habitación por ID
function getHabitacionById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM habitaciones WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Cerrar la conexión a la base de datos
function closeDatabase() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
      } else {
        console.log('Conexión a la base de datos cerrada');
        resolve();
      }
    });
  });
}

module.exports = {
  db,
  initDatabase,
  getAllHabitaciones,
  getHabitacionById,
  closeDatabase
};

