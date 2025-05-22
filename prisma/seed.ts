import { PrismaClient, EstadoAuto, MotivoNoDisponibilidad, TipoMantenimiento, Transmision, Combustible, MetodoPago, EstadoReserva, EstadoGarantia, TipoPago, TipoCalificacionUsuario, PrioridadNotificacion, TipoDeNotificacion } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const ubicaciones = await prisma.ubicacion.createMany({
    data: [
      {
        nombre: 'Centro de la Ciudad',
        descripcion: 'Ubicación céntrica con acceso rápido a principales avenidas',
        latitud: -17.783817,
        longitud: -63.180173,
        esActiva: true
      },
      {
        nombre: 'Zona Norte',
        descripcion: 'Área residencial en el norte de la ciudad',
        latitud: -17.765432,
        longitud: -63.175678,
        esActiva: true
      },
      {
        nombre: 'Terminal de Buses',
        descripcion: 'Cerca de la terminal para llegadas y salidas de viajes',
        latitud: -17.798765,
        longitud: -63.190123,
        esActiva: true
      },
      {
        nombre: 'Zona Sur',
        descripcion: 'Área comercial y residencial en el sur',
        latitud: -17.810234,
        longitud: -63.185678,
        esActiva: true
      }
    ]
  });

  const usuarios = await prisma.usuario.createMany({
    data: [
      {
        nombre: 'Dieter',
        apellido: 'Olmos Alvarado',
        email: 'carlos@example.com',
        telefono: '65373977',
        direccion: 'Av. Central #123',
        contraseña: 'pass123',
        esAdmin: false,
      },
      {
        nombre: 'Lucía',
        apellido: 'Martínez',
        email: 'lucia@example.com',
        telefono: '63925990',
        direccion: 'Calle Sur #456',
        contraseña: 'pass456',
        esAdmin: true,
      },
      {
        nombre: 'Camila',
        apellido: 'Root',
        email: 'admin@example.com',
        telefono: '61600005',
        direccion: 'sin direccion',
        contraseña: 'adminpass',
        esAdmin: true,
      },
      {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        telefono: '75953581',
        direccion: 'Av. Norte #789',
        contraseña: 'juanpass',
        esAdmin: false,
      },
      {
        nombre: 'María',
        apellido: 'González',
        email: 'maria@example.com',
        telefono: '77452771',
        direccion: 'Calle Este #101',
        contraseña: 'mariapass',
        esAdmin: false,
      },
      {
        nombre: 'Roberto',
        apellido: 'Sánchez',
        email: 'roberto@example.com',
        telefono: '63952028',
        direccion: 'Av. Oeste #202',
        contraseña: 'robpass',
        esAdmin: false,
      }
    ]
  });

  const todosUsuarios = await prisma.usuario.findMany({
    select: {
      idUsuario: true,
      nombre: true,
      email: true
    }
  });
  
  const drivers = await prisma.driver.createMany({
    data: [
      {
        idUsuario: todosUsuarios[0].idUsuario,
        licencia: "DRV-12345",
        fechaExpiracion: new Date("2026-05-15"),
        tipoLicencia: "B",
        añosExperiencia: 5,
        disponible: true
      },
      {
        idUsuario: todosUsuarios[3].idUsuario,
        licencia: "DRV-67890",
        fechaExpiracion: new Date("2025-08-22"),
        tipoLicencia: "A",
        añosExperiencia: 3,
        disponible: true
      },
      {
        idUsuario: todosUsuarios[4].idUsuario,
        licencia: "DRV-54321",
        fechaExpiracion: new Date("2027-03-10"),
        tipoLicencia: "B",
        añosExperiencia: 7,
        disponible: false
      }
    ]
  });
  
  const todosDrivers = await prisma.driver.findMany({
    select: {
      idDriver: true,
      idUsuario: true
    }
  });
  
  const findDriverIdSafely = (userIndex: number) => {
    const userId = todosUsuarios[userIndex].idUsuario;
    const driver = todosDrivers.find(d => d.idUsuario === userId);
    
    if (!driver) {
      console.warn(`Warning: No driver found for user ${userId} (index ${userIndex})`);
      return null;
    }
    
    return driver.idDriver;
  };
  
  const usuarioDriverData = [];
  
  const driverForUser0 = findDriverIdSafely(0);
  if (driverForUser0) {
    usuarioDriverData.push({
      idUsuario: todosUsuarios[1].idUsuario,
      idDriver: driverForUser0,
      fechaAsignacion: new Date()
    });
    
    usuarioDriverData.push({
      idUsuario: todosUsuarios[5].idUsuario,
      idDriver: driverForUser0,
      fechaAsignacion: new Date()
    });
  }
  
  const driverForUser3 = findDriverIdSafely(3);
  if (driverForUser3) {
    usuarioDriverData.push({
      idUsuario: todosUsuarios[1].idUsuario,
      idDriver: driverForUser3,
      fechaAsignacion: new Date()
    });
    
    usuarioDriverData.push({
      idUsuario: todosUsuarios[3].idUsuario,
      idDriver: driverForUser3,
      fechaAsignacion: new Date()
    });
  }
  
  const driverForUser4 = findDriverIdSafely(4);
  if (driverForUser4) {
    usuarioDriverData.push({
      idUsuario: todosUsuarios[2].idUsuario,
      idDriver: driverForUser4,
      fechaAsignacion: new Date()
    });
    
    usuarioDriverData.push({
      idUsuario: todosUsuarios[5].idUsuario,
      idDriver: driverForUser4,
      fechaAsignacion: new Date()
    });
  }
  
  if (usuarioDriverData.length > 0) {
    const usuariosDrivers = await prisma.usuarioDriver.createMany({
      data: usuarioDriverData
    });
    console.log(`Created ${usuarioDriverData.length} usuarioDriver relationships`);
  } else {
    console.log('No valid usuarioDriver relationships to create');
  }

  const autos = await prisma.auto.createMany({
    data: [
      {
        idPropietario: 3,
        idUbicacion: 1,
        marca: 'Toyota',
        modelo: 'Corolla',
        descripcion: 'Auto cómodo y económico.',
        precioRentaDiario: 55.50,
        montoGarantia: 200.00,
        kilometraje: 15000,
        calificacionPromedio: 4.5,
        totalComentarios: 2,
        tipo: 'Familiar',
        año: 2020,
        placa: 'ABC-1234',
        color: 'Negro',
        estado: EstadoAuto.ACTIVO,
        asientos: 5,
        capacidadMaletero: 3,
        transmision: Transmision.AUTOMATICO,
        combustible: Combustible.GASOLINA,
        diasTotalRenta: 0,
        vecesAlquilado: 0
      },
      {
        idPropietario: 2,
        idUbicacion: 2,
        marca: 'Honda',
        modelo: 'Civic',
        descripcion: 'Con buen rendimiento.',
        precioRentaDiario: 60.00,
        montoGarantia: 250.00,
        kilometraje: 18000,
        calificacionPromedio: 2.5,
        totalComentarios: 2,
        tipo: 'Pequeño',
        año: 2019,
        placa: 'XYZ-5678',
        color: 'Rojo',
        estado: EstadoAuto.INACTIVO,
        asientos: 4,
        capacidadMaletero: 4,
        transmision: Transmision.MANUAL,
        combustible: Combustible.GASOLINA,
        diasTotalRenta: 0,
        vecesAlquilado: 0
      },
      {
        idPropietario: 2,
        idUbicacion: 1,
        marca: 'Ford',
        modelo: 'Focus',
        descripcion: 'Ideal para viajes largos.',
        precioRentaDiario: 70.00,
        montoGarantia: 300.00,
        kilometraje: 10000,
        calificacionPromedio: 4.5,
        totalComentarios: 2,
        tipo: 'Mediano',
        año: 2021,
        placa: 'QWE-9876',
        color: 'Blanco',
        estado: EstadoAuto.ACTIVO,
        asientos: 5,
        capacidadMaletero: 2,
        transmision: Transmision.AUTOMATICO,
        combustible: Combustible.DIESEL,
        diasTotalRenta: 0,
        vecesAlquilado: 0
      },
      {
        idPropietario: 3,
        idUbicacion: 3,
        marca: 'Chevrolet',
        modelo: 'Onix',
        descripcion: 'Compacto pero eficiente.',
        precioRentaDiario: 65.00,
        montoGarantia: 220.00,
        kilometraje: 12000,
        calificacionPromedio: 4.0,
        totalComentarios: 1,
        tipo: 'Familiar',
        año: 2022,
        placa: 'DEF-4567',
        color: 'Azul',
        estado: EstadoAuto.ACTIVO,
        asientos: 5,
        capacidadMaletero: 5,
        transmision: Transmision.MANUAL,
        combustible: Combustible.GASOLINA,
        diasTotalRenta: 0,
        vecesAlquilado: 0
      },
      {
        idPropietario: 4,
        idUbicacion: 2,
        marca: 'Volkswagen',
        modelo: 'Golf',
        descripcion: 'Deportivo y ágil.',
        precioRentaDiario: 75.00,
        montoGarantia: 350.00,
        kilometraje: 8000,
        calificacionPromedio: 5.0,
        totalComentarios: 1,
        tipo: 'Familiar',
        año: 2021,
        placa: 'GHI-8910',
        color: 'Gris',
        estado: EstadoAuto.ACTIVO,
        asientos: 5,
        capacidadMaletero: 5,
        transmision: Transmision.AUTOMATICO,
        combustible: Combustible.GASOLINA,
        diasTotalRenta: 0,
        vecesAlquilado: 0
      },
      {
        idPropietario: 5,
        idUbicacion: 4,
        marca: 'Nissan',
        modelo: 'Sentra',
        descripcion: 'Confortable y espacioso.',
        precioRentaDiario: 62.50,
        montoGarantia: 275.00,
        kilometraje: 22000,
        calificacionPromedio: 3.0,
        totalComentarios: 1,
        tipo: 'Familiar',
        año: 2020,
        placa: 'JKL-1112',
        color: 'Plateado',
        estado: EstadoAuto.INACTIVO,
        asientos: 5,
        capacidadMaletero: 5,
        transmision: Transmision.AUTOMATICO,
        combustible: Combustible.GASOLINA,
        diasTotalRenta: 0,
        vecesAlquilado: 0
      },
      {
        idPropietario: 6,
        idUbicacion: 3,
        marca: 'Hyundai',
        modelo: 'Tucson',
        descripcion: 'SUV familiar con gran espacio.',
        precioRentaDiario: 85.00,
        montoGarantia: 400.00,
        kilometraje: 5000,
        calificacionPromedio: 4.5,
        totalComentarios: 2,
        tipo: 'Familiar',
        año: 2022,
        placa: 'MNO-1314',
        color: 'Verde',
        estado: EstadoAuto.ACTIVO,
        asientos: 7,
        capacidadMaletero: 5,
        transmision: Transmision.AUTOMATICO,
        combustible: Combustible.HIBRIDO,
        diasTotalRenta: 0,
        vecesAlquilado: 0
      }
    ]
  });

  await prisma.comentario.createMany({
    data: [
      {
        idAuto: 1,
        idUsuario: 2,
        contenido: 'Muy buen auto, limpio y eficiente.',
        calificacion: 5,
        fechaCreacion: new Date()
      },
      {
        idAuto: 1,
        idUsuario: 4,
        contenido: 'Excelente rendimiento de combustible.',
        calificacion: 4,
        fechaCreacion: new Date()
      },
      {
        idAuto: 2,
        idUsuario: 1,
        contenido: 'El auto estaba algo sucio, pero funcionaba bien.',
        calificacion: 3,
        fechaCreacion: new Date()
      },
      {
        idAuto: 2,
        idUsuario: 5,
        contenido: 'Problemas con el aire acondicionado.',
        calificacion: 2,
        fechaCreacion: new Date()
      },
      {
        idAuto: 3,
        idUsuario: 2,
        contenido: 'Excelente experiencia, lo recomiendo.',
        calificacion: 4,
        fechaCreacion: new Date()
      },
      {
        idAuto: 3,
        idUsuario: 6,
        contenido: 'Muy cómodo para viajes largos.',
        calificacion: 5,
        fechaCreacion: new Date()
      },
      {
        idAuto: 4,
        idUsuario: 3,
        contenido: 'Buen auto para ciudad.',
        calificacion: 4,
        fechaCreacion: new Date()
      },
      {
        idAuto: 5,
        idUsuario: 4,
        contenido: 'Divertido de manejar, muy deportivo.',
        calificacion: 5,
        fechaCreacion: new Date()
      },
      {
        idAuto: 6,
        idUsuario: 5,
        contenido: 'Espacioso pero con alto consumo.',
        calificacion: 3,
        fechaCreacion: new Date()
      },
      {
        idAuto: 7,
        idUsuario: 6,
        contenido: 'Perfecto para familia grande.',
        calificacion: 5,
        fechaCreacion: new Date()
      },
      {
        idAuto: 7,
        idUsuario: 1,
        contenido: 'Tecnología avanzada a bordo.',
        calificacion: 4,
        fechaCreacion: new Date()
      }
    ]
  });

  await prisma.historialMantenimiento.createMany({
    data: [
      {
        idAuto: 1,
        fechaInicio: new Date('2024-12-10'),
        fechaFin: new Date('2024-12-10'),
        descripcion: 'Cambio de aceite y filtros.',
        costo: 45.00,
        tipoMantenimiento: TipoMantenimiento.PREVENTIVO,
        kilometraje: 14000
      },
      {
        idAuto: 1,
        fechaInicio: new Date('2025-03-15'),
        fechaFin: new Date('2025-03-15'),
        descripcion: 'Rotación de llantas.',
        costo: 25.00,
        tipoMantenimiento: TipoMantenimiento.PREVENTIVO,
        kilometraje: 14800
      },
      {
        idAuto: 2,
        fechaInicio: new Date('2024-11-01'),
        fechaFin: new Date('2024-11-03'),
        descripcion: 'Reparación del sistema eléctrico.',
        costo: 150.00,
        tipoMantenimiento: TipoMantenimiento.CORRECTIVO,
        kilometraje: 17000
      },
      {
        idAuto: 2,
        fechaInicio: new Date('2025-02-20'),
        fechaFin: new Date('2025-02-21'),
        descripcion: 'Reparación de aire acondicionado.',
        costo: 120.00,
        tipoMantenimiento: TipoMantenimiento.CORRECTIVO,
        kilometraje: 17500
      },
      {
        idAuto: 3,
        fechaInicio: new Date('2025-01-15'),
        fechaFin: new Date('2025-01-15'),
        descripcion: 'Revisión general anual.',
        costo: 70.00,
        tipoMantenimiento: TipoMantenimiento.REVISION,
        kilometraje: 9500
      },
      {
        idAuto: 4,
        fechaInicio: new Date('2025-03-01'),
        fechaFin: new Date('2025-03-01'),
        descripcion: 'Cambio de bujías.',
        costo: 60.00,
        tipoMantenimiento: TipoMantenimiento.PREVENTIVO,
        kilometraje: 11500
      },
      {
        idAuto: 5,
        fechaInicio: new Date('2025-04-10'),
        fechaFin: new Date('2025-04-10'),
        descripcion: 'Alineación y balanceo.',
        costo: 55.00,
        tipoMantenimiento: TipoMantenimiento.PREVENTIVO,
        kilometraje: 7500
      },
      {
        idAuto: 6,
        fechaInicio: new Date('2025-02-05'),
        fechaFin: new Date('2025-02-07'),
        descripcion: 'Cambio de transmisión.',
        costo: 800.00,
        tipoMantenimiento: TipoMantenimiento.CORRECTIVO,
        kilometraje: 21000
      },
      {
        idAuto: 7,
        fechaInicio: new Date('2025-01-20'),
        fechaFin: new Date('2025-01-20'),
        descripcion: 'Primer mantenimiento.',
        costo: 90.00,
        tipoMantenimiento: TipoMantenimiento.PREVENTIVO,
        kilometraje: 4500
      }
    ]
  });

  await prisma.disponibilidad.createMany({
    data: [
      {
        idAuto: 1,
        fechaInicio: new Date('2025-04-20'),
        fechaFin: new Date('2025-04-22'),
        motivo: MotivoNoDisponibilidad.USO_PERSONAL,
        descripcion: 'Viaje del dueño.'
      },
      {
        idAuto: 1,
        fechaInicio: new Date('2025-05-15'),
        fechaFin: new Date('2025-05-20'),
        motivo: MotivoNoDisponibilidad.OTRO,
        descripcion: 'Rentado por cliente.'
      },
      {
        idAuto: 2,
        fechaInicio: new Date('2025-05-01'),
        fechaFin: new Date('2025-05-03'),
        motivo: MotivoNoDisponibilidad.MANTENIMIENTO,
        descripcion: 'Revisión de frenos.'
      },
      {
        idAuto: 3,
        fechaInicio: new Date('2025-04-25'),
        fechaFin: new Date('2025-04-28'),
        motivo: MotivoNoDisponibilidad.OTRO,
        descripcion: 'Reservado para evento de empresa.'
      },
      {
        idAuto: 4,
        fechaInicio: new Date('2025-05-10'),
        fechaFin: new Date('2025-05-15'),
        motivo: MotivoNoDisponibilidad.USO_PERSONAL,
        descripcion: 'Rentado para vacaciones.'
      },
      {
        idAuto: 5,
        fechaInicio: new Date('2025-04-30'),
        fechaFin: new Date('2025-05-05'),
        motivo: MotivoNoDisponibilidad.USO_PERSONAL,
        descripcion: 'Viaje familiar del propietario.'
      },
      {
        idAuto: 6,
        fechaInicio: new Date('2025-04-15'),
        fechaFin: new Date('2025-05-15'),
        motivo: MotivoNoDisponibilidad.MANTENIMIENTO,
        descripcion: 'Reparación mayor de motor.'
      },
      {
        idAuto: 7,
        fechaInicio: new Date('2025-05-01'),
        fechaFin: new Date('2025-05-10'),
        motivo: MotivoNoDisponibilidad.OTRO,
        descripcion: 'Rentado por familia numerosa.'
      }
    ]
  });

  await prisma.imagen.createMany({
    data: [
      // Toyota Corolla
      { idAuto: 1, direccionImagen: '/imagenesAutos/Toyota/Lado.png' },
      { idAuto: 1, direccionImagen: '/imagenesAutos/Toyota/Lateral.png' },
      { idAuto: 1, direccionImagen: '/imagenesAutos/Toyota/Parte_posterior.png' },


      // Honda Civic
      { idAuto: 2, direccionImagen: '/imagenesAutos/Honda/Lateral.jpg' },
      { idAuto: 2, direccionImagen: '/imagenesAutos/Honda/Interior.png' },
      { idAuto: 2, direccionImagen: '/imagenesAutos/Honda/Interior_sillas.png' },

      // Ford Focus
      { idAuto: 3, direccionImagen: '/imagenesAutos/Ford/Lateral.jpeg' },
      { idAuto: 3, direccionImagen: '/imagenesAutos/Ford/Interior.jpeg' },
      { idAuto: 3, direccionImagen: '/imagenesAutos/Ford/Lateral_Trasera.jpeg' },
      { idAuto: 3, direccionImagen: '/imagenesAutos/Ford/Vista_Lateral.jpeg' },

      // Chevrolet Onix
      { idAuto: 4, direccionImagen: '/imagenesAutos/Chevrolet/frontal.png' },
      { idAuto: 4, direccionImagen: '/imagenesAutos/Chevrolet/Interior.png' },
      { idAuto: 4, direccionImagen: '/imagenesAutos/Chevrolet/Lateral.png' },

      // Volkswagen Golf
      { idAuto: 5, direccionImagen: '/imagenesAutos/Volkswagen/Frontal.jpg' },
      { idAuto: 5, direccionImagen: '/imagenesAutos/Volkswagen/Perfil.jpg' },
      { idAuto: 5, direccionImagen: '/imagenesAutos/Volkswagen/Interior_techos.jpg' },
      { idAuto: 5, direccionImagen: '/imagenesAutos/Volkswagen/Asientos.jpg' },

      // Nissan Sentra
      { idAuto: 6, direccionImagen: '/imagenesAutos/Nissan/Frontal.jpg' },
      { idAuto: 6, direccionImagen: '/imagenesAutos/Nissan/Lateral.jpg' },
      { idAuto: 6, direccionImagen: '/imagenesAutos/Nissan/Panel.jpg' },

      // Hyundai Tucson
      { idAuto: 7, direccionImagen: '/imagenesAutos/Hyundai/Frontal.jpg' },
      { idAuto: 7, direccionImagen: '/imagenesAutos/Hyundai/Interior_espacioso.jpg' },
      { idAuto: 7, direccionImagen: '/imagenesAutos/Hyundai/Tercera_fila.jpg' },
      { idAuto: 7, direccionImagen: '/imagenesAutos/Hyundai/Maletero.jpg' }
    ]
  });

  // Crear algunas reservas de ejemplo
  const reservas = await prisma.reserva.createMany({
    data: [
      {
        fechaInicio: new Date('2025-05-15'),
        fechaFin: new Date('2025-05-20'),
        idAuto: 1,
        idCliente: 4,
        estado: EstadoReserva.CONFIRMADA,
        fechaSolicitud: new Date('2025-05-01'),
        fechaAprobacion: new Date('2025-05-02'),
        fechaLimitePago: new Date('2025-05-10'),
        montoTotal: 277.50, // 5 días * 55.50
        kilometrajeInicial: 15000,
        estaPagada: true
      },
      {
        fechaInicio: new Date('2025-05-01'),
        fechaFin: new Date('2025-05-10'),
        idAuto: 7,
        idCliente: 1,
        estado: EstadoReserva.CONFIRMADA,
        fechaSolicitud: new Date('2025-04-15'),
        fechaAprobacion: new Date('2025-04-16'),
        fechaLimitePago: new Date('2025-04-25'),
        montoTotal: 850.00, // 10 días * 85.00
        kilometrajeInicial: 5000,
        estaPagada: true
      },
      {
        fechaInicio: new Date('2025-06-01'),
        fechaFin: new Date('2025-06-07'),
        idAuto: 3,
        idCliente: 5,
        estado: EstadoReserva.SOLICITADA,
        fechaSolicitud: new Date('2025-05-15'),
        fechaLimitePago: new Date('2025-05-25'),
        montoTotal: 490.00, // 7 días * 70.00
        estaPagada: false
      }
    ]
  });

  await prisma.pago.createMany({
    data: [
      {
        idReserva: 1,
        monto: 277.50,
        fechaPago: new Date('2025-05-05'),
        metodoPago: MetodoPago.QR,
        referencia: 'PAG-00001',
        tipo: TipoPago.RENTA
      },
      {
        idReserva: 1,
        monto: 200.00,
        fechaPago: new Date('2025-05-05'),
        metodoPago: MetodoPago.TARJETA_DEBITO,
        referencia: 'PAG-00002',
        tipo: TipoPago.GARANTIA
      },
      {
        idReserva: 2,
        monto: 850.00,
        fechaPago: new Date('2025-04-20'),
        metodoPago: MetodoPago.QR,
        referencia: 'PAG-00003',
        tipo: TipoPago.RENTA
      },
      {
        idReserva: 2,
        monto: 400.00,
        fechaPago: new Date('2025-04-20'),
        metodoPago: MetodoPago.QR,
        referencia: 'PAG-00004',
        tipo: TipoPago.GARANTIA
      }
    ]
  });

  // Crear garantías para reservas confirmadas
  await prisma.garantia.createMany({
    data: [
      {
        idReserva: 1,
        monto: 200.00,
        fechaDeposito: new Date('2025-05-05'),
        estado: EstadoGarantia.DEPOSITADA,
        comprobante: 'comp_garantia_001.pdf'
      },
      {
        idReserva: 2,
        monto: 400.00,
        fechaDeposito: new Date('2025-04-20'),
        estado: EstadoGarantia.DEPOSITADA,
        comprobante: 'comp_garantia_002.pdf'
      }
    ]
  });

  // Crear algunas notificaciones de ejemplo
  await prisma.notificacion.createMany({
    data: [
      {
        idUsuario: 1,
        titulo: 'Reserva confirmada',
        mensaje: 'Tu reserva para el Hyundai Tucson ha sido confirmada',
        idEntidad: '2',
        tipoEntidad: 'reserva',
        tipo: TipoDeNotificacion.RESERVA_APROBADA,
        prioridad: PrioridadNotificacion.ALTA
      },
      {
        idUsuario: 3,
        titulo: 'Nueva solicitud de reserva',
        mensaje: 'Has recibido una nueva solicitud de reserva para tu Toyota Corolla',
        idEntidad: '1',
        tipoEntidad: 'reserva',
        tipo: TipoDeNotificacion.RESERVA_SOLICITADA,
        prioridad: PrioridadNotificacion.MEDIA
      },
      {
        idUsuario: 6,
        titulo: 'Reserva recibida',
        mensaje: 'Has recibido una nueva solicitud de reserva para tu Hyundai Tucson',
        idEntidad: '2',
        tipoEntidad: 'reserva',
        tipo: TipoDeNotificacion.RESERVA_SOLICITADA,
        prioridad: PrioridadNotificacion.MEDIA
      },
      {
        idUsuario: 2,
        titulo: 'Nueva solicitud de reserva',
        mensaje: 'Has recibido una nueva solicitud de reserva para tu Ford Focus',
        idEntidad: '3',
        tipoEntidad: 'reserva',
        tipo: TipoDeNotificacion.RESERVA_SOLICITADA,
        prioridad: PrioridadNotificacion.MEDIA
      }
    ]
  });

  // Crear algunas calificaciones de usuarios
  await prisma.calificacionUsuario.createMany({
    data: [
      {
        idCalificador: 3,
        idCalificado: 4,
        puntuacion: 5,
        comentario: 'Excelente cliente, muy puntual',
        fechaCreacion: new Date('2025-05-21'),
        idReserva: 1,
        tipoCalificacion: TipoCalificacionUsuario.ARRENDATARIO
      },
      {
        idCalificador: 4,
        idCalificado: 3,
        puntuacion: 4,
        comentario: 'Vehículo en excelentes condiciones',
        fechaCreacion: new Date('2025-05-21'),
        idReserva: 2,  
        tipoCalificacion: TipoCalificacionUsuario.ARRENDADOR
      }
    ]
  });
}

main()
  .then(() => {
    console.log('Datos insertados con éxito 🚀');
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect();
  });