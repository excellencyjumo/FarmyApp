import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { notFound, errorHandler } from "./src/middleware/errorMiddleware.js";
import routes from "./src/routes/index.js";
import farmRoutes from "./src/routes/farms/farmRoutes.js";
import farmProductRoutes from "./src/routes/farms/farmProductRoutes.js";
import userRoutes from "./src/routes/customers/userRoutes.js";
import storeProductRoute from "./src/routes/stores/storeProductRoutes.js";
import storeRoutes from "./src/routes/stores/storeRoutes.js";
import waitlistRoutes from "./src/routes/waitlist.js";
import storeCartRoute from "./src/routes/cart/store.js";
import farmCartRoute from "./src/routes/cart/farm.js";
import authRoute from "./src/routes/auth.js";
import chatServer from "./chatServer.js";
import logisticsRoutes from "./src/routes/logistics/logisticsRoutes.js";
import userRoute from "./src/routes/user.js";

dotenv.config({ path: "./config.env" });

const port = process.env.PORT || 5000;

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).catch((err) => console.log(err));

const app = express();
app.use(
  cors({
    credentials: true,
    origin: "*",
  })
);

// app.use(express.static(path.join(__dirname, "./client/build")));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "./client/build", "index.html"));
// });

app.use(helmet());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/user/profile", userRoute);

app.use("/api/v1/farm", farmRoutes);
app.use("/api/v1/storeproducts", storeProductRoute);
app.use("/api/v1/storeproducts/cart", storeCartRoute);
app.use("/api/v1/farmproducts/cart", farmCartRoute);
app.use("/api/v1/farmproducts", farmProductRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/waitlist", waitlistRoutes);
app.use("/api/v1/store", storeRoutes);

app.use("/api/v1/logistics", logisticsRoutes);

app.use(notFound);
app.use(express.json());
// app.use(express.urlencoded())
app.use(errorHandler);

// app.listen(port, () => console.log(`Server started on port ${port}`));

chatServer(app);
// routes(app); // why this?
