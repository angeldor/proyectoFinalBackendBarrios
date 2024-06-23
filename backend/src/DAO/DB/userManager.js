import UserDTO from "../../DTO/user.DTO.js";
import { userModel } from "../models/user.model.js";

class UserManager {
  // obtener usuario actual
  async getCurrentUser(userId) {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const { username, email, roles } = user;
    return new UserDTO(username, email, roles);
  }

  // buscar usuario por mail
  static async getUserByEmail(email) {
    return await userModel.findOne({ email });
  }

  // validar usuario email y contraseña
  static async getUserByCreds(email, password) {
    return await userModel.findOne({ email, password });
  }

  // guardado del usuario en la DB
  static async insertUser(first_name, last_name, age, email, password) {
    return await new userModel({
      first_name,
      last_name,
      age,
      email,
      password,
      role,
    }).save();
  }

  // buscar el usuario por su ID dentro de mongoDB
  static async getUserById(id) {
    return await userModel
      .findOne({ _id: id }, { first_name: 1, last_name: 1, age: 1, email: 1 })
      .lean();
  }

  // cambiar rol de usuario
  static async changeUserRole(userId, newRole) {
    try {
      const user = await userModel.findById(userId);
      if (!user) {
        throw new Error(`User with id ${userId} not found.`);
      }

      user.role = newRole;

      await user.save();
      return user;
    } catch (error) {
      throw error;
    }
  }

  // obtencion de la password del usuario
  static async getCurrentPassword(userId) {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error("User not found.");
    }

    return user.password;
  }

  // nuevo método para agregar documentos
  static async addDocuments(userId, documents) {
    try {
      const user = await userModel.findById(userId);
      if (!user) {
        throw new Error(`User with id ${userId} not found.`);
      }

      user.documents.push(...documents);
      user.last_connection = new Date();

      await user.save();
      return user;
    } catch (error) {
      throw error;
    }
  }

  // nuevo método para encontrar usuario por ID
  static async findById(userId) {
    return await userModel.findById(userId);
  }

// Obtener todos los usuarios
  async getAllUsers() {
    return await userModel.find({
      first_name: 1,
      last_name: 1,
      email: 1,
      role: 1,
    });
  }

 // Obtener usuarios inactivos
  async getInactiveUsers(minutes) {
    const inactiveDate = new Date();
    inactiveDate.setMinutes(inactiveDate.getMinutes() - minutes);
    return await userModel.find({last_conection: {$lt: inactiveDate} });
  }

 // Eliminar usuario por ID
 async deleteUserById(userId){
  const user = await userModel.findById(userId);

  if (!user) {
    throw new Error(`Usuario con ID ${userId} no encontrado.`);
  };

  const mailOptions = {
    to: user.email,
    subject: 'Cuenta eliminada',
    text: `Tu cuenta ha sido eliminada.`,
  };

  await sendMail(mailOptions.to, mailOptions.subject, mailOptions.text);

  return await userModel.findByIdAndDelete(userId);
 }
}

export default UserManager;
