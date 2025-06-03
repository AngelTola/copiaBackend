import multer from 'multer';
import { v2 as cloudinary, UploadApiOptions } from 'cloudinary';

// Definir tipos personalizados para Cloudinary
interface CloudinaryFile extends Express.Multer.File {
  path: string;
  filename: string;
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const sanitize = (name: string) => {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
              .replace(/[^a-zA-Z0-9]/g, "_");
};

const storage = multer.memoryStorage();

const uploadToCloudinary = async (req: any, res: any, next: any) => {
  try {
    if (!req.files || (!req.files.imagenes && !req.files.qrImage)) {
      return next();
    }

    const user = req.user as { idUsuario: number; nombreCompleto: string };
    const nombreSanitizado = sanitize(user.nombreCompleto);

    // Procesar archivos
    const uploadPromises: Promise<any>[] = [];

    // Función helper para subir un archivo
    const uploadFile = (file: Express.Multer.File, tipo: string) => {
      return new Promise((resolve, reject) => {
        const uploadOptions: UploadApiOptions = {
          folder: `uploads/usuario_${user.idUsuario}_${nombreSanitizado}/${tipo}`,
          public_id: `${file.fieldname}_${Date.now()}_${Math.round(Math.random() * 1e9)}`,
          resource_type: 'auto',
          transformation: [
            { width: 1000, height: 1000, crop: 'limit' },
            { quality: 'auto' }
          ]
        };

        cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              console.error('❌ Error subiendo a Cloudinary:', error);
              reject(error);
            } else {
              console.log('✅ Archivo subido:', result?.public_id);
              resolve({
                fieldname: file.fieldname,
                originalname: file.originalname,
                url: result?.secure_url,
                public_id: result?.public_id,
                path: result?.secure_url,
                filename: result?.public_id 
              });
            }
          }
        ).end(file.buffer);
      });
    };

    // Procesar imágenes
    if (req.files.imagenes) {
      const imagenes = Array.isArray(req.files.imagenes) ? req.files.imagenes : [req.files.imagenes];
      for (const imagen of imagenes) {
        uploadPromises.push(uploadFile(imagen, 'vehiculo'));
      }
    }

    // Procesar QR
    if (req.files.qrImage) {
      const qrFiles = Array.isArray(req.files.qrImage) ? req.files.qrImage : [req.files.qrImage];
      for (const qrFile of qrFiles) {
        uploadPromises.push(uploadFile(qrFile, 'qr'));
      }
    }

    const uploadedFiles = await Promise.all(uploadPromises);

    req.files = {
      imagenes: uploadedFiles.filter(f => f.fieldname === 'imagenes'),
      qrImage: uploadedFiles.filter(f => f.fieldname === 'qrImage')
    };

    next();
  } catch (error) {
    console.error('❌ Error en uploadToCloudinary:', error);
    next(error);
  }
};

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
  
  console.log(`🔍 Verificando archivo: ${file.originalname}, tipo: ${file.mimetype}, campo: ${file.fieldname}`);
  
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Formato de imagen inválido. Permitidos: ${allowed.join(', ')}`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB por archivo
    files: 7 // máximo 7 archivos total (6 imágenes + 1 QR)
  },
});

export default upload;
export { uploadToCloudinary };