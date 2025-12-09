import { Router } from "express";
import { saludo, inicio } from "../controllers/mainController.js";
const router = Router();

router.get("/", inicio);

router.get("/saludo/:nombre", saludo);



export default router;
