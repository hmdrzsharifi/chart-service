import { tsvParse, csvParse } from  "d3-dsv";
import { timeParse } from "d3-time-format";

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

const parseDate = timeParse("%Y-%m-%d");

export function getData() {
	const promiseMSFT = fetch("https://cdn.rawgit.com/rrag/react-stockcharts/master/docs/data/MSFT.tsv")
		.then(response => response.text())
		.then(data => tsvParse(data, parseData(parseDate)))
	return promiseMSFT;
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

	/*const ws = new WebSocket('ws://172.31.13.34:8080/websocket')

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
	}*/
}
