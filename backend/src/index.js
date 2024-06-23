import express from "express";
import mongoose from "mongoose";
import passport from "./passport.config.js";
import errorHandler from "./errorHandler.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import swaggerConfig from "./swagger.js";
import connectMongo from 'connect-mongo';

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

// Configurar Swagger
swaggerConfig(app);

// Conectar a MongoDB
mongoose
  .connect('mongodb://localhost:27017/ecommerce', {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
})

.then(() => {
  console.log("Conexion a MongoDB exitosa");
})
.catch((error) => {
  console.log("Error al conectar con MongoDB: ", error);
});

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(
  session({
    secret: 'secreto.secreto',
    resave: false,
    saveUninitialized: false,
    cookie:{ secure: false }
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(errorHandler);

app.use((req, res, next)=> {
  if(!req.isAuthenticated() && req.originalUrl !== "/login"){
    res.redirect("/user/login");
  } else {
    next();
  };
});
