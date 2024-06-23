import { expect } from "chai";
import { request } from "express";
import app from "../src/index.js";
import chai from "chai";
import chaiHttp from "chai-http";
import { productModel } from "../src/DAO/models/product.model.js";

describe("Product Router", () => {
  // Test para la ruta de añadir un producto
  describe("POST /addproduct", () => {
    it("Debería añadir un nuevo producto y devolver el producto añadido", async () => {
      const newProduct = {
        title: "Nuevo Producto",
        description: "Descripción del nuevo producto",
        price: 50,
      };

      const res = await request(app)
        .post("/addproduct")
        .send(newProduct)
        .expect(201);

      // Verifica que el producto devuelto coincida con el producto enviado
      expect(res.body).to.have.property("title", newProduct.title);
      expect(res.body).to.have.property("description", newProduct.description);
      expect(res.body).to.have.property("price", newProduct.price);
    });
  });

  // Test para la ruta de actualizar un producto
  describe("PUT /updateproduct/:id", () => {
    it("Debería actualizar un producto existente y devolver el producto actualizado", async () => {
      const productId = "ID_DEL_PRODUCTO_EXISTENTE";
      const updatedProductData = {};

      const res = await request(app)
        .put(`/updateproduct/${productId}`)
        .send(updatedProductData)
        .expect(200);

      // Verifica que el producto devuelto coincida con los datos actualizados
      expect(res.body).to.have.property("title", updatedProductData.title);
      expect(res.body).to.have.property(
        "description",
        updatedProductData.description
      );
    });
  });
});

chai.use(chaiHttp);
const expect = chai.expect;

describe("Product Router", () => {
  describe("GET /products", () => {
    it("Debería devolver una lista de productos", async () => {
      const res = await chai.request(app).get("/products");
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("array");
    });
  });
});

describe("Cart Router", () => {
  describe("POST /createcart", () => {
    it("Debería crear un nuevo carrito", async () => {
      const res = await chai.request(app).post("/createcart");
      expect(res).to.have.status(201);
      expect(res.body).to.have.property("id");
    });
  });
});
describe("Session Router", () => {
  describe("POST /login", () => {
    it("Debería iniciar sesión correctamente con credenciales válidas", async () => {
      const credentials = {
        email: "user@example.com",
        password: "password123",
      };
      const res = await chai.request(app).post("/login").send(credentials);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property("message").equal("Login successful");
    });
  });
});

describe("Product Router", () => {
  // Prueba para obtener la lista de productos
  describe("GET /products", () => {
    it("Debería devolver una lista de productos", async () => {
      const res = await chai.request(app).get("/products");
      expect(res).to.have.status(200); // Verifica que el código de estado sea 200
      expect(res.body).to.be.an("array"); // Verifica que el cuerpo de la respuesta sea un arreglo
    });
  });
});

describe("Cart Router", () => {
  // Prueba para crear un nuevo carrito
  describe("POST /createcart", () => {
    it("Debería crear un nuevo carrito", async () => {
      const res = await chai.request(app).post("/createcart");
      expect(res).to.have.status(201); // Verifica que el código de estado sea 201
      expect(res.body).to.have.property("id"); // Verifica que el cuerpo de la respuesta tenga la propiedad 'id'
    });
  });
});

describe("Session Router", () => {
  // Prueba para iniciar sesión con credenciales válidas
  describe("POST /login", () => {
    it("Debería iniciar sesión correctamente con credenciales válidas", async () => {
      const credentials = {
        email: "user@example.com",
        password: "password123",
      };
      const res = await chai.request(app).post("/login").send(credentials);
      expect(res).to.have.status(200); // Verifica que el código de estado sea 200
      expect(res.body).to.have.property("message").equal("Login successful"); // Verifica el mensaje de éxito
    });
  });
});


