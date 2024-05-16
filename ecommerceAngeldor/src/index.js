import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import passport from "./passport.config.js";
import errorHandler from "./errorHandler.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import nodemailer from 'nodemailer';
// import { transport } from "winston";
import swaggerConfig from "./swagger.js";

dotenv.config();
const mongoURL = process.env.MONGO_URL;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
const emailPassword = process.env.EMAIL_PASSWORD;
const secret = process.env.SESSION_SECRET;
const email = process.env.EMAIL;

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

import productRouter from "./routes/productRouter.js";
import userRouter from "./routes/userRouter.js";
import cartRouter from "./routes/cartRouter.js";

app.use("/product", productRouter);
app.use("/user", userRouter);
app.use("/cart", cartRouter);


swaggerConfig(app);
mongoose
  .connect(mongoURL, {
    userNewUrlParser: true,
    useUnifiedTopology: true,
  })

  .then(() => {
    console.log("Conexion a MongoDB exitosa");
  })
  .catch((error) => {
    console.log("Error al conectar con MongoDB: ", error);
  });

app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());
app.use(errorHandler);
app.use(cookieParser());

app.use(
  session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
  })
);

app.use((req, res, next)=> {
  if(!req.isAuthenticated() && req.originalUrl !== "/login"){
    res.redirect("/login");
  } else {
    next();
  };
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: email ,
    pass: emailPassword,
  },
});

export default transporter;