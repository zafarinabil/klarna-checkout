import { MongoExpiredSessionError } from "mongodb";
import fetch from "node-fetch";

export async function getProducts() {
    const response = await fetch(`${process.env.FAKE_STORE_API_URL}/products`);
    const products = await response.json();
    return products;
}

export async function getProduct(id) {
    const response = await fetch(`${process.env.FAKE_STORE_API_URL}/products/${id}`);
    const product = await response.json();
    return product;  
}