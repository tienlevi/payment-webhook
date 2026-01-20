import { Router } from "express";
import { billingPortal, createProduct, paymentLink } from "./controllers.js";

const router = Router();

router.get("/billing-portal/:customerId", billingPortal);
router.post("/product", createProduct);
router.post("/payment-link", paymentLink);

export default router;
