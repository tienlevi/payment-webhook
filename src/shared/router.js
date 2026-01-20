import { Router } from "express";
import { billingPortal, createProduct } from "./controllers.js";

const router = Router();

router.get("/billing-portal/:customerId", billingPortal);
router.post("/product", createProduct);

export default router;
