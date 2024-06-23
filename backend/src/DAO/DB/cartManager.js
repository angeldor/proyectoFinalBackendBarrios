import { cartModel } from "../models/cart.model.js";

class CartManager {
  // crear carrito
  async createCart() {
    const newCart = new cartModel({ items: [], total: 0 });
    await newCart.save();
    return newCart._id;
  }
  // obtener carrito por su id
  async getCart(cartId) {
    return cartModel.findById(cartId);
  }
  // obtenter todos los carritos
  async getAllCarts() {
    return cartModel.find();
  }
  // agregar productos al carrito
  async addToCart(cartId, productId, quantity = 1) {
    try {
      const cart = await cartModel.findById(cartId);
      if (!cart) {
        throw new Error(`Cart with id ${cartId} not found.`);
      }
      const product = await productModel.findById(productId);
      if (!product) {
        throw new Error(`Product with id ${productId} not found.`);
      }

      if (product.owner === cart.user && cart.userRole === "premium") {
        throw new Error(
          `Premium user cannot add their own product to the cart.`
        );
      }

      const subtotal = product.price * quantity;
      cart.items.push({ productId, quantity });
      cart.total += subtotal;
      await cart.save();
      return cart;
    } catch (error) {
      console.error("Error adding product to cart:", error.message);
      throw error;
    }
  }

  // eliminar productos del carrito
  async removeFromCart(cartId, productId) {
    try {
      const cart = await cartModel.findById(cartId);
      if (!cart) {
        throw new Error(`Cart with id ${cartId} not found.`);
      }

      // Buscar el índice del item dentro de cart.items
      const itemIndex = cart.items.findIndex((item) =>
        item.productId.equals(productId)
      );
      if (itemIndex !== -1) {
        const { price, quantity } = cart.items[itemIndex];
        const subtotal = price * quantity;

        cart.total -= subtotal;
        cart.items.splice(itemIndex, 1);

        await cart.save();
        return cart;
      } else {
        throw new Error(`Product with id ${productId} not found in the cart.`);
      }
    } catch (error) {
      console.error("Error removing product from cart:", error.message);
      throw error;
    }
  }
  async updateCart(cartId) {
    if (!mongoose.Types.ObjectId.isValid(cartId)) {
      throw new Error(`Invalid cart ID: ${cartId}`);
    }
    try {
      const cart = await cartModel.findById(cartId);
      if (!cart) {
        throw new Error(`Cart with id ${cartId} not found.`);
      }
      let newTotal = 0;

      for (const item of cart.items) {
        const product = await productModel.findById(item.productId);
        if (product) {
          newTotal += product.price * item.quantity;
        }
      }

      cart.total = newTotal;
      await cart.save();

      console.log(`Cart with id ${cartId} updated successfully.`);
      return cart;
    } catch (error) {
      console.error("Error updating cart:", error.message);
      throw error;
    }
  }
}

export default CartManager;
