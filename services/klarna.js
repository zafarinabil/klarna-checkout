import fetch from 'node-fetch';

export function getKlarnaAuth() {
	const username = process.env.PUBLIC_KEY;
	const password = process.env.SECRET_KEY;
	// const auth = `Basic ${Buffer.from(username + ':' + password).toString('base64')}`;
	const auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
	return auth;
}

// Create a order at Klarna
export async function createOrder(product) {
	const path = '/checkout/v3/orders';
	const auth = getKlarnaAuth();

	const url = process.env.BASE_URL + path;
	const method = 'POST';
	const headers = {
		'Content-Type': 'application/json',
		Authorization: auth
	};

	const quantity = 1;
	const price = product.price * 100;
	const total_amount = price * quantity;
	const total_tax_amount = total_amount * 0.2;

	const payload = {
		purchase_country: 'SE',
		purchase_currency: 'SEK',
		locale: 'sv-SE',
		order_amount: total_amount,
		order_tax_amount: total_tax_amount,
		order_lines: [
			{
				type: 'physical',
				reference: product.id,
				name: product.title,
				quantity,
				quantity_unit: 'pcs',
				unit_price: price,
				tax_rate: 2500,
				total_amount,
				total_discount_amount: 0,
				total_tax_amount
			}
		],
		merchant_urls: {
			terms: 'https://www.example.com/terms.html',
			checkout: 'https://www.example.com/checkout.html?order_id={checkout.order.id}',
			confirmation: `${process.env.CONFIRMATION_URL}?order_id={checkout.order.id}`,
			push: 'https://www.example.com/api/push?order_id={checkout.order.id}'
		}
	};

	const body = JSON.stringify(payload);
	const response = await fetch(url, { method, headers, body });
	const jsonResponse = await response.json();

	if (response.status === 200 || response.status === 201) {
		return jsonResponse;
	} else {
		console.error('ERROR: ', jsonResponse);
		return {
			html_snippet: `<p>${JSON.stringify(jsonResponse)}</p>`
		};
	}
}

// Retrieve a order at Klarna
export async function retrieveOrder(order_id) {
	const path = '/checkout/v3/orders/' + order_id;
	const auth = getKlarnaAuth();

	const url = process.env.BASE_URL + path;
	const method = 'GET';
	const headers = { Authorization: auth };
	const response = await fetch(url, { method, headers });

	if (response.status === 200 || response.status === 201) {
		const jsonResponse = await response.json();
		return jsonResponse;
	} else {
		console.error('ERROR: ', response.status, response.statusText);
		return {
			html_snippet: `<p>${response.status} ${response.statusText}</p>`
		};
	}
}