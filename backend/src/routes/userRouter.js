import express from "express";
import { sendMail } from "../emailservice.js";
import { userModel } from "../DAO/models/user.model.js";
import UserRepository from "../DAO/DB/userRepository.js";
import UserController from "../controller.js";

const userRouter = express.Router();

userRouter.get("/ping", (req, res) => {
  res.send("pong");
});

userRouter.get("/", async(req, res)=>{
  try {
    const users = await UserRepository.getAllUsers();
    const userList = users.map(user => ({
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      role: user.role,
    }));
    res.status(200).json(userList);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

userRouter.delete("/", async (req, res)=>{
  try {
    const users = await UserRepository.getInactiveUsers(30);
    const deletePromises = users.map(user => {
      return UserRepository.deleteUserById(user._id).then(() => {
        const mailOptions = {
          to: user.email,
          subject: 'Cuenta eliminada por inactividad',
          text: `Hola ${user.first_name}, tu cuenta ha sido eliminada por inactividad.`,
        };
        return sendMail(mailOptions.to, mailOptions.subject, mailOptions.text);
      });
    });

    await Promise.all(deletePromises);
    res.status(200).json({ message: 'Usuarios inactivos eliminados' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar usuarios inactivos' });
  }
});

userRouter.post("/premium/:uid", UserController.changeUserRole);

function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next(); // Si está autenticado, permite continuar
  } else {
    res.status(401).json({ message: 'Acceso no autorizado' });
  }
}

// ruta para documentos
userRouter.post("/:uid/documents", UserController.uploadDocuments);

userRouter.get("/loggerTest", (req, res) => {
  devLogger.debug("Debug message");
  devLogger.info("Information message");
  devLogger.warn("Warning message");
  devLogger.error("Error message");
  devLogger.fatal("Fatal message");
  res.send("Logs generated successfully");
});

////////////////////////// password recovery //////////////////////////

userRouter.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // Expira en 1 hora
    await user.save();

    const resetLink = `http://localhost:8080/reset-password/${token}`;

    const subject = "Restablecer contraseña";
    const text = `Para restablecer tu contraseña, haz clic en el siguiente enlace: ${resetLink}`;
    const html = `<p>Para restablecer tu contraseña, haz clic en el siguiente enlace: <a href="${resetLink}">${resetLink}</a></p>`;

    await sendMail(user.email, subject, text, html);

    res.status(200).json({
      message: "Correo electrónico de restablecimiento de contraseña enviado.",
    });
  } catch (error) {
    console.error(
      "Error al enviar el correo electrónico de restablecimiento de contraseña:",
      error
    );
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

// Cambiar contraseña
userRouter.post("/changePassword", async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  try {
    const currentPasswordFromDB = await UserRepository.getCurrentPassword(
      userId
    );

    if (currentPassword === currentPasswordFromDB) {
      return res
        .status(400)
        .send("La nueva contraseña debe ser diferente a la contraseña actual");
    }

    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    user.password = newPassword;
    await user.save();

    res.status(200).send("Contraseña actualizada correctamente.");
  } catch (error) {
    console.error("Error al cambiar la contraseña: ", error.message);
    res
      .status(500)
      .send(
        "Ocurrió un error al cambiar la contraseña. Por favor, intentalo de nuevo mas tarde."
      );
  }
});

userRouter.get("/current", async(req, res)=>{
  try {
    const userId = req.user.id;
    const currentUser = await UserRepository.getCurrentUser(userId);
    res.json(currentUser);
  } catch (error) {
    res.status(500).json({message: error.message});
  };
});

userRouter.put("/:userid/role", UserController.changeUserRole);

userRouter.post("/register", async (req, res)=> {
  const { first_name, last_name, age, email, password } = req.body;

  try {
    const existingUser = await UserRepository.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "El correo electrónico ya está en uso." });
    };
    const newUser = await UserRepository.insertUser({ first_name, last_name, age, email, password });
    res.status(201).json({ message: "Usuario registrado exitosamente.", user: newUser });
  } catch (error) {
    console.error("Error al registrar el usuario:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  };
});

userRouter.post("/login", async(req, res)=>{
  const {email, password} = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Missing email or password" });
  };

  try {
    let user = await UsersDAO.getUserByCreds(email, password);
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
    } else {
      req.session.user = user._id;
      res.status(200).json({ message: "Login successful", userId: user._id });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  };
});

userRouter.get("/logout", async(req, res)=>{
  req.session.destroy((err)=>{
    if (err) {
      console.error('Error al cerrar sesión:', err);
      res.status(500).json({ message: "Error logging out" });
    } else {
      res.status(200).json({ message: "Logout successful" });
    };
  });
});

export default userRouter;
