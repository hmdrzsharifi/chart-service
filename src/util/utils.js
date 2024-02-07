import { tsvParse, csvParse } from  "d3-dsv";
import { timeParse } from "d3-time-format";
import {DATA_ADDRESS} from "../config/constants";

export function parseData(parse) {
	return function(d) {
		d.date = parse(d.date);
		d.open = +d.open;
		d.high = +d.high;
		d.low = +d.low;
		d.close = +d.close;
		d.volume = +d.volume;

		return d;
	};
}

export function parseEODData(d) {
	// return function(d) {
		// d.date = new Date(+d.t);
		// console.log(d);
		d.date = new Date(+d.t);
		d.open = +d.o;
		d.high = +d.h;
		d.low = +d.l;
		d.close = +d.c;
		d.volume = +d.v;

		return d;
	// };
}

export function convertEODData(d) {
	// return function(d) {
	// d.date = new Date(+d.t);
	// console.log(d);
	d.date = new Date(+d.t);
	d.open = +d.o;
	d.high = +d.h;
	d.low = +d.l;
	d.close = +d.c;
	d.volume = +d.v;

	return d;
	// };
}

const parseDate = timeParse("%Y-%m-%d");

/*export function getData() {
	const promiseMSFT = fetch("https://cdn.rawgit.com/rrag/react-stockcharts/master/docs/data/MSFT.tsv")
		.then(response => response.text())
		.then(data => tsvParse(data, parseData(parseDate)))
	return promiseMSFT;
}*/

function mapObject(originalObject) {
	return {
		date: new Date(originalObject.date),
		open: originalObject.open,
		high: originalObject.high,
		low: originalObject.low,
		close: originalObject.close,
		volume: originalObject.volume,
		split: "",
		dividend: "",
		absoluteChange: "",
		percentChange:""
	};
}

/*export async function fetchCandleData(symbol, tf, from, to) {
	const url = DATA_ADDRESS;
	const requestBody = {
		"Ticker": symbol,
		"TimeFrame": tf,
		"from": from,
		"to": to
	};

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(requestBody),
		})
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const json = await response.json();
		if (json.status !== 'ok') {
			throw new Error(`Response status is not ok: ${json.status}`);
		}

		const parsedData = json.data.map(parseData(parseDate));
		return parsedData;
	} catch (error) {
		console.error('There was an error fetching the candle data:', error);
		throw error; // Re-throw the error for the calling code to handle
	}
}*/

export async function fetchCandleData(symbol, tf, from, to) {
	const url = DATA_ADDRESS;
	const requestBody = {
		"Ticker": symbol,
		"TimeFrame": tf,
		"from": from,
		"to": to
	};
	const resultData = [];
	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(requestBody),
		})
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const json = await response.json();

		const jsonData = JSON.parse(json.data);
		jsonData.forEach(entry => {
			resultData.push(mapObject(entry));
		});

		return resultData;
	} catch (error) {
		console.error('There was an error fetching the candle data:', error);
		throw error; // Re-throw the error for the calling code to handle
	}

}

export function getWebsocketData() {


	// const ws = new WebSocket('wss://ws.eodhistoricaldata.com/ws/us?api_token=62c547eb00d445.30059582')
/*	const ws = new WebSocket('wss://ws.eodhistoricaldata.com/ws/us?api_token=62c547eb00d445.30059582')
	ws.onopen = () => {
		console.log('ws opened on browser')
		ws.send('{"action": "subscribe", "symbols": "AMZN, TSLA"}\n')
	}

	ws.onmessage = (message) => {
		console.log(`message received ${message.data}`)
		tsvParse(message, parseData(parseDate))
	}*/

	const ws = new WebSocket('ws://localhost:8001')

	ws.onerror = (event) => {
		console.log('error ' + event.message)
	}

	ws.onopen = () => {
		console.log('ws opened on browser')
		// ws.send('{"action": "subscribe", "symbols": "AMZN, TSLA"}\n')
		// ws.send('{"action": "subscribe", "symbols": "AMZN, TSLA"}\n')
	}

	ws.onmessage = (message) => {
		console.log(`message received ${message.data}`)
		// tsvParse(message, parseWSData(parseDate))
	}
}
