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
    db.serialize(() => {
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
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS alquileres (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          habitacion_id INTEGER NOT NULL,
          estudiante_nombre TEXT NOT NULL,
          estudiante_doc TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (habitacion_id) REFERENCES habitaciones(id)
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
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

function crearAlquiler({ habitacionId, estudianteNombre, estudianteDoc }) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 1) verificar que exista y esté disponible
      db.get(
        "SELECT * FROM habitaciones WHERE id = ? AND disponible = 1",
        [habitacionId],
        (err, hab) => {
          if (err) return reject(err);
          if (!hab) return resolve(null); // no existe o ya está ocupada

          // 2) insertar alquiler
          db.run(
            `INSERT INTO alquileres (habitacion_id, estudiante_nombre, estudiante_doc)
             VALUES (?, ?, ?)`,
            [habitacionId, estudianteNombre, estudianteDoc],
            function (err2) {
              if (err2) return reject(err2);

              // 3) marcar como no disponible
              db.run(
                "UPDATE habitaciones SET disponible = 0 WHERE id = ?",
                [habitacionId],
                (err3) => {
                  if (err3) return reject(err3);

                  resolve({
                    alquiler_id: this.lastID,
                    habitacion_id: habitacionId,
                    estudiante_nombre: estudianteNombre,
                    estudiante_doc: estudianteDoc,
                  });
                }
              );
            }
          );
        }
      );
    });
  });
}

function getAlquileres() {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT a.id, a.habitacion_id, a.estudiante_nombre, a.estudiante_doc, a.created_at,
              h.titulo, h.precio, h.ubicacion
       FROM alquileres a
       JOIN habitaciones h ON h.id = a.habitacion_id
       ORDER BY a.created_at DESC`,
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
}

module.exports = {
  db,
  initDatabase,
  getAllHabitaciones,
  getHabitacionById,
  crearAlquiler,
  getAlquileres,
  closeDatabase
};

