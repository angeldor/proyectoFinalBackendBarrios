import { productModel } from "../models/product.model.js";

class ProductManager {
  // crear producto
  async createProduct(req, res) {
    const {
      title,
      description,
      price,
      image,
      code,
      stock,
      category,
      thumbnail,
    } = req.body;

    const userId = req.user.id;
    const user = await UserModel.findById(userId);
    const isUserPremium = user.role === "premium";

    const newProduct = new productModel({
      title,
      description,
      price,
      image,
      code,
      stock,
      category,
      thumbnail,
      owner: isUserPremium ? user.email : "admin",
      isUserPremium,
    });

    await newProduct.save();
  }
  // obtener productos
  async gerProducts() {
    return productModel.find();
  }
  // obtener producto por ID
  async getProductById(id) {
    return productModel.findById(id);
  }
  // actualizar producto
  async updateProduct(productId, updatedProduct) {
    const product = await productModel.findById(productId);
    if (!product) {
      throw new Error(`Product with id ${productId} not found.`);
    }
    Object.assign(product, updatedProduct);

    await product.save();

    return product;
  }
  //eliminar un producto
  async deleteProduct(productId){
    const product = await productModel.findById(productId);
    if (!product){
        throw new Error(`Product with id ${productId} not found.`);

    };
    await product.deleteOne();
  };
};

export default ProductManager;