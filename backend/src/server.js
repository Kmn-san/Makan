import express from "express";
import cors from "cors";
import { ENV } from "./config/env.js";
import staffRoutes from "./routes/staffRoutes.js"
import kitchenRoutes from "./routes/kitchenRoutes.js"
import cashierRoutes from "./routes/cashierRoutes.js"
import adminRoutes from "./routes/adminRoutes.js";

import restaurantRoutes from "./routes/restaurantRoutes.js"
import tableRoutes from "./routes/tableRoutes.js"
import menuRoutes from "./routes/menuRoutes.js"
import customerRoutes from "./routes/customerRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"
import paymentRoutes from "./routes/paymentRoutes.js"
import { clerkMiddleware } from "@clerk/express";

const app = express();
const PORT = ENV.PORT;

app.use(express.json());
app.use(clerkMiddleware())
app.use(cors());

app.get("/", (req, res) => {
    res.json({
        message: "Backend is running!",
        timestamp: new Date().toISOString()
    })
})

app.use("/api/staff", staffRoutes)
app.use("/api/staff/kitchen", kitchenRoutes)
app.use('/api/staff/cashier', cashierRoutes);
app.use('/api/admin', adminRoutes)

app.use('/api/restaurants', restaurantRoutes);
app.use('/api/tables', tableRoutes);
app.use("/api/menu", menuRoutes)
app.use("/api/customer", customerRoutes)
app.use("/api/order", orderRoutes)
app.use("/api/payments", paymentRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
})