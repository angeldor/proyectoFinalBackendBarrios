import UserManager from "./DAO/DB/userManager.js";

class UserController{
    static async changeUserRole(req, res, next) {
        const userId = req.params.userId;
        const newRole = req.body.role;

        try{
            const updatedUser = await UserManager.changeUserRole(userId, newRole);
            res.json(updatedUser);
        }catch(error){
            next(error);
        };
    };
};

export default UserController;