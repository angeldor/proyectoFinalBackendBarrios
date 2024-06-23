import express from "express";
import mongoose from "mongoose";
import CartRepository from "../DAO/DB/cartRepository.js";
import { cartModel } from "../DAO/models/cart.model.js";
import ProductManager from "../DAO/DB/productManager.js";
import ProductRepository from "../DAO/DB/productRepository.js";

const cartRouter = express.Router();

cartRouter.get("/ping", (req, res) => {
  res.send("pong");
});

cartRouter.get("/cartlist", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "admin") {
      return res.status(403).send("Acceso no autorizado");
    }

    let carts = await CartRepository.getAllCarts();

    const limit = req.query.limit;

    if (limit) {
      carts = carts.slice(0, parseInt(limit, 10));
    }

    res.send(carts);
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
});

cartRouter.post("/createcart", async (req, res) => {
  try {
    if (req.session.user && req.session.user.role === "admin") {
      return res.status(403).send("acceo no autorizado para administradores");
    }
    const newCartId = await CartRepository.createCart();
    res.status(201).send({ id: newCartId, items: [], total: 0 });
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
});

cartRouter.get("/api/:cid", async (req, res) => {
  const cartId = req.params.cid;

  try {
    const cart = await CartRepository.getCart(cartId);

    if (cart) {
      const productsDetails = [];

      for (const item of cart.items) {
        const product = await ProductRepository.getProductById(item.productId);
        if (product) {
          productsDetails.push({ product, quantity: item.quantity });
        }
      }

      let formattedProducts = productsDetails.map((item) => {
        return {
          title: item.product.title,
          description: item.product.description,
          price: item.product.price,
        };
      });

      let cartTotal = cart.total;

      res.json({ cart, formattedProducts, cartTotal });
    } else {
      res.status(404).send(`Error 404: Cart with ID ${cartId} not found.`);
    }
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
});

cartRouter.post("/api/carts/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    if (!req.session.user || req.session.user.cartId !== cid) {
      return res.status(403).send("Acceso no autorizado para este carrito");
    }

    const cart = await CartRepository.addToCart(cid, pid, quantity);
    res.status(200).json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

cartRouter.delete("/api/carts/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    if (!req.session.user || req.session.user.cartId !== cid) {
      return res.status(403).send("Acceso no autorizado para este carrito");
    }

    await CartRepository.removeFromCart(cid, pid);

    return res.json({
      status: "success",
      message: "Product removed from cart succesfully.",
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
});

cartRouter.put("/api/carts/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    if (!mongoose.Types.ObjectId.isValid(cid)) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid cart Id" });
    }

    const { products } = req.body;

    if (!Array.isArray(products)) {
      return res
        .status(400)
        .json({ status: "error", message: "Products should be an array" });
    }

    console.log("Cart ID:", cid);

    const updatedCart = await cartManager.updateCart(cid, products);

    res.json({
      status: "success",
      message: "Cart updated successfully",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Error updating cart:", error.message);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});
//////////////////////////Ticket//////////////////////////

cartRouter.post("/carts/:cid/purchase", async (req, res) => {
  const cartId = req.params.cid;
  try {
    const cart = await cartManager.getCart(cartId);
    if (!cart) {
      return res
        .status(404)
        .send(`Error 404: Cart with ID ${cartId} not found.`);
    }
    const productsNotPurchased = [];
    for (const item of cart.items) {
      const product = await productManager.getProductById(item.productId);
      if (!product) {
        return res
          .status(404)
          .send(`Error 404: Product with ID ${item.productId} not found.`);
      }
      if (product.stock >= item.quantity) {
        product.stock -= item.quantity;
        await product.save();
      } else {
        productsNotPurchased.push(item.productId);
      }
    }
    cart.items = cart.items.filter(
      (item) => !productsNotPurchased.includes(item.productId)
    );
    cart.total = cart.items.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );
    await cart.save();

    const ticket = await ticketManager.createTicket({
      code: generateUniqueCode(),
      amount: cart.total,
      purchaser: req.session.user.email,
      products: cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      productsNotPurchased: productsNotPurchased,
    });

    return res
      .status(200)
      .json({ status: "success", ticket, productsNotPurchased });
  } catch (error) {
    return res.status(500).send(`Error: ${error.message}`);
  }
});

export default cartRouter;
