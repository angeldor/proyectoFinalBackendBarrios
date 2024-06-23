import ProductManager from "./productManager.js";

class ProductRepository {
    static async getAllProducts() {
        return await ProductManager.getAllProducts();
    }

    static async getProductById(productId) {
        return await ProductManager.getProductById(productId);
    }

    static async addProduct(productData) {
        return await ProductManager.addProduct(productData);
    }

    static async updateProduct(productId, updatedProductData) {
        return await ProductManager.updateProduct(productId, updatedProductData);
    }

    static async deleteProduct(productId) {
        return await ProductManager.deleteProduct(productId);
    }
}

export default ProductRepository;