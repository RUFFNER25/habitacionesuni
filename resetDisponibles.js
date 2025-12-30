const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "habitaciones.db");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run("UPDATE habitaciones SET disponible = 1", (err) => {
    if (err) {
      console.error("Error:", err.message);
    } else {
      console.log("✅ Listo: todas las habitaciones están DISPONIBLES");
    }
    db.close();
  });
});
