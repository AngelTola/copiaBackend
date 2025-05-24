import { Request, Response, NextFunction } from 'express';

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const { nombre, apellido, email, contraseña, fechaNacimiento } = req.body;

  if (!nombre || !apellido || !email || !contraseña || !fechaNacimiento) {
    res.status(400).json({ message: 'Todos los campos obligatorios deben estar completos.' });
  }

 next();
};
