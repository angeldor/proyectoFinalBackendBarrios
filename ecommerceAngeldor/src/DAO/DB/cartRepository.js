import CartManager from "./cartManager.js";

class CartRepository {
  static async createCart() {
    return await CartManager.createCart();
  }

  static async getCart(cartId) {
    return await CartManager.getCart(cartId);
  }

  static async getAllCarts() {
    return await CartManager.getAllCarts();
  }

  static async addToCart(cartId, productId, quantity = 1) {
    return await CartManager.addToCart(cartId, productId, quantity);
  }

  static async removeFromCart(cartId, productId) {
    return await CartManager.removeFromCart(cartId, productId);
  }

  static async updateCart(cartId) {
    return await CartManager.updateCart(cartId);
  }
}

export default CartRepository;
