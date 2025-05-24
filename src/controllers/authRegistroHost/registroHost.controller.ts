import { Request, Response } from "express";
import { registrarHostCompleto } from "@/services/pago.service";

export const registrarHostCompletoController = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuario = req.user as { idUsuario: number };
    const {
      placa,
      soat,
      tipo,
      numeroTarjeta,
      fechaExpiracion,
      titular,
      detallesMetodo,
    } = req.body;

    //const imagenes = (req.files as any).imagenes || [];
    const qrImage = (req.files as any).qrImage?.[0];

    /*if (!placa || !soat || imagenes.length < 3) {
      res.status(400).json({ message: "Faltan datos del vehículo" });
      return;
    }
      */

    const tipoFinal =
      tipo === "card" ? "TARJETA_DEBITO" : tipo === "qr" ? "QR" : tipo === "cash" ? "EFECTIVO" : null;

    if (!tipoFinal) {
      res.status(400).json({ message: "Tipo de método de pago inválido" });
      return;
    }

    await registrarHostCompleto({
      idUsuario: usuario.idUsuario,
      placa,
      soat,
      //imagenes: imagenes.map((f: any) => f.filename),
      tipo: tipoFinal,
      numeroTarjeta,
      fechaExpiracion,
      titular,
      imagenQr: qrImage?.filename,
      detallesMetodoPago: detallesMetodo,
    });

    // ✅ No retornes res.status(...), simplemente termina con void
    res.status(201).json({ success: true, message: "Registro host completo" });
  } catch (error) {
    console.error("❌ Error al registrar host:", error);
    res.status(500).json({ message: "Error al registrar host" });
  }
};

