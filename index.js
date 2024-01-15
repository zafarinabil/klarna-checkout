import { getProducts, getProduct } from "./services/api.js";
import { createOrder, retrieveOrder } from "./services/klarna.js";
import express, { response } from "express";
const app = express();
import { config } from "dotenv";
config();

console.log(process.env.BASE_URL);

app.get('/', async (request, response) => {
    const products = await getProducts();
    // console.log(products);
    const markup = products.map((p)=>`<a style="display: block; color: black; border: solid 2px black; margin: 20px; padding: 10px;" href="/products/${p.id}"> ${p.title} <br> ${p.price} SEK<a/>`).join(" ");
    response.send(markup);
});


app.get('/products/:id', async (request, response) => {
    try {
        const { id } = request.params;
        const product = await getProduct(id);
        const klarnaResponse =  await createOrder(product);
        const markup = klarnaResponse.html_snippet;
        response.send(markup);
    } catch (error) {
        response.send(error.message)
    }
});

app.get('/confirmation', async (request, response) => {
    const { order_id } = request.query;
    const klarnaResponse = await retrieveOrder(order_id);
    const  { html_snippet } = klarnaResponse; 
    response.send(html_snippet);
});

app.listen(process.env.PORT);