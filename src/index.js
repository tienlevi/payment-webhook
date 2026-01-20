import express from "express";
import router from "./shared/router.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", router);
app.get("/", (req, res) => {
  res.json({ message: "SMS Webhook Server Running" });
});

app.listen(PORT, () => {
  console.log(`Localhost is http://localhost:3000`);

  console.log(`Server running on port ${PORT}`);
});
