import { getProducts, getProduct } from './services/api.js';
import { createOrder, retrieveOrder } from './services/klarna.js';
import express from 'express';
import { config } from 'dotenv';

config();

const app = express();

app.get('/', async (req, res) => {
	// Your existing route handling logic
	const products = await getProducts();
	const markup = products
		.map((p) => {
			console.log('Image URL:', p.title); // Log image URL
			return `<div class="product-card">
                <div class="product-img">
                    <img src="${p.images}" alt="${p.title}"/>
                </div>
                <div class="product-info">
					<h3>${p.title}</h3>
                    <p>${p.price} kr</p>
                    <button onclick="window.location.href='/product/${p.id}'">Buy</button>
                </div>
            </div>`;
		})
		.join(' ');
		//comment

	const wrapperMarkup = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
			<style>
			body {
				font-family: 'Arial', sans-serif;
				background-color: #f4f4f4;
				margin: 0;
				padding: 0;
				display: flex;
				justify-content: center;
			}
	
			.container {
				width: 100vw;
				display: flex;
				justify-content: center;
				flex-direction: column;
			}

			.header {
				text-align: center;
				width: 100%;
				background-color: white;
			}

			.products-container {
				display: flex;
				justify-content: center;
				width: 100%;
				flex-wrap: wrap;
			}
	
			.product-card {
				box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.1);
				background-color: white;
				display: flex;
				flex-direction: column;
				justify-content: start;
				align-items: center;
				width: 300px;
				height: 480px;
				margin: 10px;
				border-radius: 5px;
				padding: 10px;

			}
	
			.product-img img {
				width: 100%;
				border-radius: 5px;
			}
	
			.product-info {
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: start;
				flex-wrap: wrap;
				width: 80%;
				height: 80%;
			}

			.product-info h3 {
				font-weight: 600;
				font-size: 14px;
			}

			.product-card button {
				border: 1px solid black;
				transition: border-radius 150ms;
				width: 64px;
				padding: 8px 0;
				background-color: white;
				font-size: 14px;
				color: black;
				cursor: pointer;
				margin-top: 10px;
			}
	
			.product-card button:hover {
				border-radius: 5px;
				background-color: black;
				color: white;
			}
		</style>
            <title>Shop</title>
        </head>
        <body>

            <div class="container">
			<div class="header">
				<h1>Our Products</h1>
			</div>

			<div class="products-container">
				${markup}
			</div>
                
            </div>

			
        </body>
        </html>
    `;

	res.send(wrapperMarkup);
});

app.get('/product/:id', async function (req, res) {
	// Your existing route handling logic
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
	// Your existing route handling logic
	const order_id = req.query.order_id;
	const klarnaJsonResponse = await retrieveOrder(order_id);
	const html_snippet = klarnaJsonResponse.html_snippet;
	res.send(html_snippet);
});

app.listen(process.env.PORT, () => {
	console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
