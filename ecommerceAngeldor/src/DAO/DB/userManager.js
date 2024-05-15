import UserDTO from "../../DTO/user.DTO.js";
import { userModel } from "../models/user.model.js";

class UserManager {
  // obtener usuario actual
  async getCurrentUser(userId) {
    const user = await userModel.findById(userId);
    if(!user) {
      throw new Error("User not found");
    };
    const {username, email, roles} = user;
    return new UserDTO(username, email, roles);
  };
  // buscar usuario por mail
  static async getUserByEmail(email) {
    return await userModel.findOne({email});
  };
  // validar usuario email y contraseña
  static async getUserByCreds(email, password) {
    return await userModel.findOne({email, password});
  };
  // guardao del usuario en la DB
  static async insertUser(first_name, last_name, age, email, password) {
    return await new userModel({
      first_name,
      last_name,
      age,
      email,
      password,
      role,
    }).save();
  };
  // buscar el usuario por su ID dentro de mongoDB
  static async getUserById(id){
    return await userModel.findOne(
      {_id: id},
      {first_name: 1, last_name: 1, age: 1, email: 1 }
    ).lean();
  };

  // cambiar rol de usuario
  static async changeUserRole(userId, newRole){
    try{
      const user = await userModel.findById(userId);
      if(!user){
        throw new Error(`User with id ${userId} not found.`);
      }

      user.role = newRole;

      await user.save();
      return user;
    }catch(error){
      throw error;
    };
  };

  // obtencion de la password del usuario
  static async getCurrentPassword(userId){
    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error('User not found.');
    };

    return user.password;
  };
};

export default UserManager;