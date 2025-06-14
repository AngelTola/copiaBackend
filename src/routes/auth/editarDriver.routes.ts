    // src/routes/auth/editarDriver.routes.ts
    import { Router } from "express";
    import { editarPerfilDriver } from "../../controllers/auth/authEditarDriver/editarDriver.controller";
    import { authDriverMiddleware } from "../../middlewares/auth/authDriverMiddleware";
    import upload from "../../middlewares/auth/multer";     
    

    const router = Router();

    // PUT /api/profile - ruta protegida, permite actualizar perfil del driver y subir imágenes
    router.put(
    "/profile",
    authDriverMiddleware,
    upload.fields([
        { name: "anverso", maxCount: 1 },
        { name: "reverso", maxCount: 1 }
    ]),
    
    editarPerfilDriver
    );

    export default router;
