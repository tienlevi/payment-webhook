import { Router, raw } from "express";
import {
  billingPortal,
  createProduct,
  paymentLink,
  webhook,
} from "./controllers.js";

const router = Router();

router.get("/billing-portal/:customerId", billingPortal);
router.post("/product", createProduct);
router.post("/payment-link", paymentLink);
router.post("/webhook", raw({ type: "application/json" }), webhook);

export default router;
