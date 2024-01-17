import { getProducts, getProduct } from './services/api.js';
import { createOrder, retrieveOrder } from './services/klarna.js';
import express from 'express';
const app = express();
import { config } from 'dotenv';
config();

app.get('/', async (req, res) => {
	const products = await getProducts();
	const markup = products
		.map(
			(p) =>
				`<div style="display: flex; flex-direction: column; justify-content: space-between; align-items: center; flex: 0 0 calc(200px - 20px); margin: 10px; padding: 15px; border: 1px solid #ccc; text-align: center;">
					<p style="font-size: 16px; font-weight: bold; padding: 0; margin: 0;">${p.title}</p>
					<div style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
						<p style="font-size: 14px; color: #888; padding: 0; margin: 10px 0 0 0;">${p.price} kr</p>
						<button style="border: 1px solid black; border-radius: 6px; transition: border-radius 150ms; width: 64px; padding: 8px 0; background-color: white; font-size: 14px; color: black; cursor: pointer; margin-top: 10px;" onmouseover="this.style.borderRadius='10px'" onmouseout="this.style.borderRadius='6px'" onclick="window.location.href='/product/${p.id}'">Köp</button>
					</div>
				</div>`
		)
		.join(' ');
	const wrapperMarkup = `<div style="display: flex; flex-direction: row; flex-wrap: wrap; justify-content: center;">${markup}</div>`;
	res.send(wrapperMarkup);
});

app.get('/product/:id', async function (req, res) {
	try {
		const { id } = req.params;
		const product = await getProduct(id);
		const klarnaJsonResponse = await createOrder(product);
		const html_snippet = klarnaJsonResponse.html_snippet;
		res.send(html_snippet);
	} catch (error) {
		res.send(error.message);
	}
});

app.get('/confirmation', async function (req, res) {
	const order_id = req.query.order_id;
	const klarnaJsonResponse = await retrieveOrder(order_id);
	const html_snippet = klarnaJsonResponse.html_snippet;
	res.send(html_snippet);
});

app.listen(process.env.PORT);