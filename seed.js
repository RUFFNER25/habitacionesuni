const { db, initDatabase, closeDatabase } = require('./database');

const habitaciones = [
  {
    titulo: 'Habitación Individual - Centro',
    descripcion: 'Habitación individual cómoda y bien iluminada en el corazón de la ciudad universitaria. Perfecta para estudiantes que buscan tranquilidad y concentración.',
    precio: 350.00,
    incluye: 'Cama individual, escritorio, silla, armario, WiFi, servicios básicos (agua, luz)',
    ubicacion: 'Calle Principal 123, Centro',
    disponible: 1,
    imagen_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800'
  },
  {
    titulo: 'Habitación Compartida - Zona Norte',
    descripcion: 'Habitación compartida para 2 personas, ideal para estudiantes que buscan ahorrar. Ambiente estudiantil y cercano a varias universidades.',
    precio: 250.00,
    incluye: '2 camas individuales, 2 escritorios, armario compartido, WiFi, servicios básicos, cocina compartida',
    ubicacion: 'Avenida Universitaria 456, Zona Norte',
    disponible: 1,
    imagen_url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'
  },
  {
    titulo: 'Habitación con Baño Privado',
    descripcion: 'Habitación individual con baño privado incluido. Espacio amplio y moderno, perfecto para estudiantes que valoran la privacidad.',
    precio: 450.00,
    incluye: 'Cama individual, escritorio, silla, armario, baño privado, WiFi, servicios básicos, calefacción',
    ubicacion: 'Calle Estudiantes 789, Zona Sur',
    disponible: 1,
    imagen_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
  },
  {
    titulo: 'Habitación Económica - Zona Este',
    descripcion: 'Habitación básica pero acogedora, ideal para estudiantes con presupuesto limitado. Excelente relación calidad-precio.',
    precio: 200.00,
    incluye: 'Cama individual, escritorio pequeño, armario, WiFi, servicios básicos',
    ubicacion: 'Calle Economía 321, Zona Este',
    disponible: 1,
    imagen_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800'
  },
  {
    titulo: 'Habitación Premium - Vista al Parque',
    descripcion: 'Habitación amplia con vista al parque, completamente amueblada y con todas las comodidades. Para estudiantes que buscan lo mejor.',
    precio: 550.00,
    incluye: 'Cama queen, escritorio grande, silla ergonómica, armario empotrado, WiFi de alta velocidad, servicios básicos, aire acondicionado, calefacción, balcón',
    ubicacion: 'Avenida del Parque 654, Zona Centro',
    disponible: 1,
    imagen_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'
  },
  {
    titulo: 'Habitación Estudio - Todo en Uno',
    descripcion: 'Habitación tipo estudio con área de cocina integrada. Perfecta para estudiantes independientes que prefieren cocinar sus propias comidas.',
    precio: 400.00,
    incluye: 'Cama individual, escritorio, silla, armario, área de cocina (refrigerador pequeño, microondas, placa de inducción), WiFi, servicios básicos',
    ubicacion: 'Calle Independencia 987, Zona Oeste',
    disponible: 1,
    imagen_url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800'
  }
];

async function seedDatabase() {
  try {
    console.log('Inicializando base de datos...');
    await initDatabase();

    console.log('Insertando habitaciones...');
    
    // Verificar si ya existen habitaciones
    db.get('SELECT COUNT(*) as count FROM habitaciones', async (err, row) => {
      if (err) {
        console.error('Error al verificar habitaciones:', err);
        await closeDatabase();
        process.exit(1);
      }

      if (row.count > 0) {
        console.log(`Ya existen ${row.count} habitaciones en la base de datos.`);
        console.log('Si deseas recrear las habitaciones, elimina el archivo habitaciones.db primero.');
        await closeDatabase();
        process.exit(0);
      }

      // Insertar habitaciones
      const stmt = db.prepare(`
        INSERT INTO habitaciones (titulo, descripcion, precio, incluye, ubicacion, disponible, imagen_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      for (const habitacion of habitaciones) {
        stmt.run(
          habitacion.titulo,
          habitacion.descripcion,
          habitacion.precio,
          habitacion.incluye,
          habitacion.ubicacion,
          habitacion.disponible,
          habitacion.imagen_url
        );
      }

      stmt.finalize((err) => {
        if (err) {
          console.error('Error al insertar habitaciones:', err);
          closeDatabase().then(() => process.exit(1));
        } else {
          console.log(`✅ ${habitaciones.length} habitaciones insertadas correctamente.`);
          closeDatabase().then(() => {
            console.log('Base de datos cerrada.');
            process.exit(0);
          });
        }
      });
    });
  } catch (error) {
    console.error('Error en el proceso de seed:', error);
    await closeDatabase();
    process.exit(1);
  }
}

seedDatabase();

