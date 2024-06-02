import UserManager from "./DAO/DB/userManager.js";
import multer from 'multer';
import path from 'path';


const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        if(file.fieldname === "profile"){
            cb(null, "uploads/profiles");
        } else if (file.fieldname === "product") {
            cb(null, "uploads/products");
        } else {
            cb(null, "uploads/documents");
        };
    },
    filename: (req, file, cb) =>{
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({storage});

class UserController {
    static async changeUserRole(req, res, next) {
      const userId = req.params.uid;
      const newRole = req.body.role;
  
      try {
        const user = await UserManager.findById(userId);
        const requiredDocs = ["Identificación", "Comprobante de domicilio", "Comprobante de estado de cuenta"];
        const uploadedDocs = user.documents.map(doc => doc.name);
  
        const hasAllDocs = requiredDocs.every(doc => uploadedDocs.includes(doc));
        if (newRole === "premium" && !hasAllDocs) {
          return res.status(400).json({ error: "User has not uploaded all required documents." });
        }
  
        const updatedUser = await UserManager.changeUserRole(userId, newRole);
        res.json(updatedUser);
      } catch (error) {
        next(error);
      }
    }
  
    static async uploadDocuments(req, res, next) {
      upload.array("documents")(req, res, async (err) => {
        if (err) {
          return next(err);
        }
  
        const userId = req.params.uid;
        const files = req.files;
        const documents = files.map(file => ({
          name: file.fieldname,
          reference: file.path
        }));
  
        try {
          await UserManager.addDocuments(userId, documents);
          res.status(200).json({ message: "Documents uploaded successfully." });
        } catch (error) {
          next(error);
        }
      });
    }
  }

export default UserController;