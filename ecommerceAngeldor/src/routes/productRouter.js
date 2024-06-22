import express, { Router } from "express";
import mongoose from "mongoose";
import ProductRepository from "../DAO/DB/productRepository.js";
import { productModel } from "../DAO/models/product.model.js";

const productRouter = express.Router();

mongoose.connection.on("error", (err) => {
  console.error("Error al conectarse a Mongo", +err);
});

productRouter.get("/ping", (req, res) => {
  res.send("pong");
});

productRouter.post("/addproduct", async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      image,
      code,
      stock,
      category,
      thumbnails,
    } = req.body;
    if (!req.session.user || req.session.user.role !== "admin") {
      return res.status(403).send("Acceso no autorizado");
    }

    const newProduct = await ProductRepository.addProduct({
      title,
      description,
      price,
      image,
      code,
      stock,
      category,
      thumbnails,
    });

    res.status(201).send(newProduct);
  } catch (error) {
    res.status(400).send(`Error: ${error.message}`);
  }
});

productRouter.put("/updateproduct/:id", async (req, res) => {
  const productId = req.params.id;
  const updatedFields = req.body;

  try {
    if (!req.session.user || req.session.user.role !== "admin") {
      return res.status(403).send("Acceso no autorizado");
    }

    const updatedProduct = await ProductRepository.updateProduct(
      productId,
      updatedFields
    );
    if (updatedProduct) {
      res.send(updatedProduct);
    } else {
      res.status(404).send(`Error 404: Producto no encontrado`);
    }
  } catch (error) {
    res.status(404).send(`Error: ${error.message}`);
  }
});

productRouter.delete("/deleteproduct/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    if (!req.session.user || req.session.user.role !== "admin") {
      return res.status(403).send("Acceso no autorizado");
    }
    await ProductRepository.deleteProduct(productId);
    res.send(`Producto con ID ${productId} eliminado exitosamente.`);
  } catch (error) {
    res.status(404).send(`Error 404: ${error.message}`);
  }
});

productRouter.get("productlist", async (req, res) => {
  try {
    // Obtener parámetros de consulta
    const { limit = 10, page = 1, sort, query } = req.body;

    // Construir opciones de consulta para la paginación y ordenamiento
    const options = {
      limit: parseInt(limit, 10),
      page: parseInt(page, 10),
      sort: sort ? { price: sort === "asc" ? 1 : -1 } : null,
    };

    const categoryFilter = query
      ? { category: { $regex: new RegExp(query, "i") } }
      : {};

    // Ejecutar la consulta a la base de datos para obtener los productos paginados y filtrados
    const {
      docs: products,
      totalPages,
      page: currentPage,
      hasNextPage,
      hasPrevPage,
    } = await productModel.paginate(categoryFilter, options);

    // Mapear los productos a un formato deseado
    const formattedProducts = products.map((product) => ({
      title: product.title,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category,
    }));

    // Responder con los datos de los productos en formato JSON
    res.status(200).json({
      products: formattedProducts,
      totalPages,
      currentPage,
      hasNextPage,
      hasPrevPage,
    });
  } catch (error) {
    // Manejar errores y responder con un mensaje de error
    res.status(500).json({ error: error.message });
  }
});

productRouter.get("/productdetail/:id", async (req, res) => {
  const productId = req.params.id;

  try{
    const product = await ProductRepository.getProductById(productId);

    if(product){
      res.send(product);
    } else {
      res.status(404).send("Error 404: Product not found");
    };
  }catch(error){
    res.status(500).send(`Error: ${error.message}`);
  };
});

// Middleware para validar sesión de administrador o premium
function isAdminOrPremium(req, res, next) {
  if (req.session && req.session.user) {
    const { role } = req.session.user;
    if (role === 'admin' || role === 'premium') {
      return next(); 
    }
  }
  return res.status(403).json({ message: 'Acceso denegado. Requiere rol de administrador o premium.' });
}

productRouter.post("/addProduct", isAdminOrPremium, async (req, res)=>{
  try {
    const { title, description, price, image, code, stock, category, thumbnails } = req.body;

    const newProduct = await ProductRepository.addProduct({
      title,
      description,
      price,
      image,
      code,
      stock,
      category,
      thumbnails,
    });

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).send(`Error: ${error.message}`);
  }
});


productRouter.put("/updateproduct/:id",isAdminOrPremium, async (req, res) =>{
  const productId = req.params.id;
  const updatedFields = req.body;

  try {
    const updatedProduct = await ProductRepository.updateProduct(productId, updatedFields);
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).send(`Error: ${error.message}`);
  }
});

productRouter.delete("/deleteproduct/:id",isAdminOrPremium, async (req, res) =>{
  const productId = req.params.id;

  try {
    await ProductRepository.deleteProduct(productId);
    res.send(`Product with ID ${productId} deleted successfully.`);
  } catch (error) {
    res.status(400).send(`Error: ${error.message}`);
  }
});

productRouter.get("/productlist", async (req, res) =>{
  try {
    const products = await ProductRepository.getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(400).send(`Error: ${error.message}`);
  }
});


export default productRouter;
