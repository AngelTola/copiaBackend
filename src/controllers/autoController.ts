import { Request, Response } from "express";
import { prisma } from '../lib/prisma';
import { isValid, parseISO } from "date-fns";

export const getAutos = async (req: Request, res: Response) => {
  try {
    const autos = await prisma.auto.findMany({
      include: {
        imagenes: true,
        ubicacion: true,
        comentarios: {
          select: {
            calificacion: true,
          }
        }
      },
    });

    const autosConPromedio = autos.map(auto => {
      let promedioCalificacion = 0;
      const comentarios = auto.comentarios || [];

      if (comentarios.length > 0) {
        const sumaCalificaciones = comentarios.reduce((suma, comentario) => suma + comentario.calificacion, 0);
        promedioCalificacion = sumaCalificaciones / comentarios.length;
      }

      return {
        ...auto,
        promedioCalificacion: Number(promedioCalificacion.toFixed(1)),
      };
    });
    
    res.status(200).json({
      success: true,
      data: autosConPromedio,
    });
    
  } catch (error) {
    console.error("Error en getAutos:", error);
    res.status(500).json({
      success: false,
      message: "Error en obtener los autos",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

export const getAutoId = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id, 10);
  
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: "ID inválido proporcionado.",
      });
      return;
    }
  
    try {
      const auto = await prisma.auto.findUnique({
        where: {
          idAuto: id,
        },
        include: {
          propietario: {
            select: {
              idUsuario: true,
              nombreCompleto: true,
              telefono: true,
            },
          },
          imagenes: true,
        },
      });
  
      if (!auto) {
        res.status(404).json({
          success: false,
          message: "Auto no encontrado.",
        });
        return;
      }
  
      res.status(200).json({
        success: true,
        data: auto,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener el auto.",
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  };

export const getComentarios = async (req: Request, res: Response): Promise<void> => {
    const autoId = parseInt(req.params.id, 10);
  
    if (isNaN(autoId)) {
      res.status(400).json({
        success: false,
        message: "ID inválido proporcionado.",
      });
      return;
    }
  
    try {
      const comentarios = await prisma.comentario.findMany({
        where: {
          idAuto: autoId,
        },
        include: {
          usuario: {
            select: {
              idUsuario: true,
              nombreCompleto: true,
            },
          },
        },
        orderBy: {
          fechaCreacion: 'desc',
        }
      });
  
      res.status(200).json({
        success: true,
        data: comentarios, 
      });
  
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener los comentarios del auto.",
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  };

  export const getHost = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id, 10);
  
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: "ID inválido proporcionado.",
      });
      return;
    }
  
    try {
      const host = await prisma.usuario.findUnique({
        where: {
          idUsuario:id
        },
      });
  
      if (!host?.esAdmin) {
        res.status(400).json({
          success: false,
          message: "El propietario no es un host válido.",
        });
        return;
      }
  
      res.status(200).json({
        success: true,
        data: host
      });
  
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener el HOST del auto.",
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  };

export const getAutosDisponiblesPorFecha = async (req: Request, res: Response): Promise<void> => {
  const { inicio, fin } = req.params;

  const fechaInicio = parseISO(inicio);
  const fechaFin = parseISO(fin);

  if (!isValid(fechaInicio) || !isValid(fechaFin) || fechaInicio > fechaFin) {
    res.status(400).json({
      success: false,
      message: "Fechas inválidas o fuera de rango.",
    });
    return;
  }

  try {
    const fechaInicio = parseISO(inicio).toISOString().split("T")[0];
    const fechaFin = parseISO(fin).toISOString().split("T")[0];
    const autosDisponibles = await prisma.auto.findMany({
      where: {
        disponibilidad: {
          none: {
            AND: [
              {
                fechaInicio: { lte: new Date(`${fechaFin}T23:59:59.999Z`) },
              },
              {
                fechaFin: { gte: new Date(`${fechaInicio}T00:00:00.000Z`) },
              },
            ],
          },
        },
        reservas: {
          none: {
            AND: [
              { estado: "CONFIRMADA" },
              { fechaInicio: { lte: new Date(`${fechaFin}T23:59:59.999Z`) } },
              { fechaFin: { gte: new Date(`${fechaInicio}T00:00:00.000Z`) } },
            ],
          },
        },
      },
        select: {
          idAuto: true,
          marca:true,
          modelo:true,
          capacidadMaletero:true,
          asientos:true,
          transmision:true,
          combustible:true,
          kilometraje:true,
          precioRentaDiario:true,
          calificacionPromedio:true,
          imagenes:true,
        },
      });
  
      res.status(200).json({
        success: true,
        data: autosDisponibles,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener autos disponibles.",
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  };

  export const getDrivers = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.id, 10);
  
      if (isNaN(userId)) {
        res.status(400).json({ error: 'ID de usuario inválido' });
        return;
      }
  
      const usuario = await prisma.usuario.findUnique({
        where: { idUsuario: userId },
        include: {
          driversAsignados: {
            include: {
              driver: true,
            },
          },
        },
      });
  
      if (!usuario) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
  
      const drivers = usuario.driversAsignados.map((asignacion) => asignacion.driver);
  
      res.status(200).json(drivers);
    } catch (error) {
      console.error('Error al obtener los drivers:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
