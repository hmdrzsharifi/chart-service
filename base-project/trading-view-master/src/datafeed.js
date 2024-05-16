import {
	makeApiRequest,
	generateSymbol,
	parseFullSymbol,
} from './helpers.js';
import {
	subscribeOnStream,
	unsubscribeFromStream,
} from './streaming.js';
// import {DATA_ADDRESS} from "./constants";

const url = 'http://127.0.0.1:5000';



const lastBarsCache = new Map();

// DatafeedConfiguration implementation

function mapObjectFinnhub(originalObject) {
	return {
		time: originalObject.t * 1000,
		open: originalObject.o,
		high: originalObject.h,
		low: originalObject.l,
		close: originalObject.c,
	};
}

function mapSymbolResult(originalObject) {
	return {
		full_name:originalObject.symbol,
		description:originalObject.symbol,
		exchange:'BINANCE',
		type:'CRT',
	};
}
const configurationData = {
	// Represents the resolutions for bars supported by your datafeed
	supported_resolutions: ['1', '5', '15', '30', '60', '1D', '1W', '1M'],

	// The `exchanges` arguments are used for the `searchSymbols` method if a user selects the exchange
	exchanges: [{
		value: 'BINANCE',
		name: 'BINANCE',
		desc: 'BINANCE',
	},
	// {
	// 	value: 'Kraken',
	// 	// Filter name
	// 	name: 'Kraken',
	// 	// Full exchange name displayed in the filter popup
	// 	desc: 'Kraken bitcoin exchange',
	// },
	],
	// The `symbols_types` arguments are used for the `searchSymbols` method if a user selects this symbol type
	symbols_types: [{
		name: 'CRT',
		value: 'CRT',
	},
	],
};

// Obtains all symbols for all exchanges supported by CryptoCompare API
async function getAllSymbols() {
	// const data = await makeApiRequest('data/v3/all/exchanges');
	// let allSymbols = [];

	const resultData = [];
	try {
		const response = await fetch('http://185.148.147.219:3333/api/v1/services/all/symbols', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			}
			// body: JSON.stringify(requestBody),
		})
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const json = await response.json();
		console.log({json})

		// const jsonData = JSON.parse(json);
		json.forEach((entry) => {
			resultData.push(mapSymbolResult(entry));
				});
				console.log({resultData})
				return resultData;
				} catch (error) {
					console.error('There was an error fetching the candle data:', error);
					throw error; // Re-throw the error for the calling code to handle
				}

	// for (const exchange of configurationData.exchanges) {
	// 	const pairs = data.Data[exchange.value].pairs;
	//
	// 	for (const leftPairPart of Object.keys(pairs)) {
	// 		const symbols = pairs[leftPairPart].map(rightPairPart => {
	// 			const symbol = generateSymbol(exchange.value, leftPairPart, rightPairPart);
	// 			return {
	// 				symbol: symbol.short,
	// 				full_name: symbol.full,
	// 				description: symbol.short,
	// 				exchange: exchange.value,
	// 				type: 'crypto',
	// 			};
	// 		});
	// 		allSymbols = [...allSymbols, ...symbols];
	// 	}
	// }
	// return resultData;
}
// async function getAllSymbols() {
// 	const data = await makeApiRequest('data/v3/all/exchanges');
// 	let allSymbols = [];
//
// 	for (const exchange of configurationData.exchanges) {
// 		const pairs =	 data.Data[exchange.value].pairs;
//
// 		for (const leftPairPart of Object.keys(pairs)) {
// 			const symbols = pairs[leftPairPart].map(rightPairPart => {
// 				const symbol = generateSymbol(exchange.value, leftPairPart, rightPairPart);
// 				return {
// 					symbol: symbol.short,
// 					full_name: symbol.full,
// 					description: symbol.short,
// 					exchange: exchange.value,
// 					type: 'crypto',
// 				};
// 			});
// 			allSymbols = [...allSymbols, ...symbols];
// 		}
// 	}
// 	return allSymbols;
// }

export default {
	onReady: (callback) => {
		console.log('[onReady]: Method call');
		setTimeout(() => callback(configurationData));
	},

	searchSymbols: async (
		userInput,
		exchange,
		symbolType,
		onResultReadyCallback,
	) => {
		console.log('[searchSymbols]: Method call');
		const symbols = await getAllSymbols();
		// const newSymbols = symbols.filter(symbol => {
		// 	const isExchangeValid = exchange === '' || symbol.exchange === exchange;
		// 	const isFullSymbolContainsInput = symbol.full_name
		// 		.toLowerCase()
		// 		.indexOf(userInput.toLowerCase()) !== -1;
		// 	return isExchangeValid && isFullSymbolContainsInput;
		// });
		onResultReadyCallback(symbols);
	},

	resolveSymbol: async (
		symbolName,
		onSymbolResolvedCallback,
		onResolveErrorCallback,
		extension
	) => {
		console.log('[resolveSymbol]: Method call', symbolName);
		// const symbols = await getAllSymbols();
		// const symbolItem = symbols.find(({
		// 	full_name,
		// }) => full_name === symbolName);
		// if (!symbolItem) {
		// 	console.log('[resolveSymbol]: Cannot resolve symbol', symbolName);
		// 	onResolveErrorCallback('cannot resolve symbol');
		// 	return;
		// }
		// Symbol information object
		const symbolInfo = {
			ticker: 'BINANCE:BTCUSDT',
			name: 'BTCUSDT',
			description: 'CRT',
			type: 'CRT',
			session: '24x7',
			timezone: 'Etc/UTC',
			exchange: 'crypto',
			minmov: 1,
			pricescale: 100,
			has_intraday: true,
			has_no_volume: true,
			has_weekly_and_monthly: false,
			supported_resolutions: configurationData.supported_resolutions,
			volume_precision: 2,
			data_status: 'streaming',
		};

	 	console.log('[resolveSymbol]: Symbol resolved', symbolName);
		onSymbolResolvedCallback(symbolInfo);
	},

	// getBars: async (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
	// 	const { from, to, firstDataRequest } = periodParams;
	// 	console.log('[getBars]: Method call', symbolInfo, resolution, from, to);
	// 	const parsedSymbol = parseFullSymbol(symbolInfo.full_name);
	// 	const urlParameters = {
	// 		e: parsedSymbol.exchange,
	// 		fsym: parsedSymbol.fromSymbol,
	// 		tsym: parsedSymbol.toSymbol,
	// 		toTs: to,
	// 		limit: 2000,
	// 	};
	// 	const query = Object.keys(urlParameters)
	// 		.map(name => `${name}=${encodeURIComponent(urlParameters[name])}`)
	// 		.join('&');
	// 	try {
	// 		const data = await makeApiRequest(`data/histoday?${query}`);
	// 		if (data.Response && data.Response === 'Error' || data.Data.length === 0) {
	// 			// "noData" should be set if there is no data in the requested period
	// 			onHistoryCallback([], {
	// 				noData: true,
	// 			});
	// 			return;
	// 		}
	// 		let bars = [];
	// 		data.Data.forEach(bar => {
	// 			if (bar.time >= from && bar.time < to) {
	// 				bars = [...bars, {
	// 					time: bar.time * 1000,
	// 					low: bar.low,
	// 					high: bar.high,
	// 					open: bar.open,
	// 					close: bar.close,
	// 				}];
	// 			}
	// 		});
	// 		if (firstDataRequest) {
	// 			lastBarsCache.set(symbolInfo.full_name, {
	// 				...bars[bars.length - 1],
	// 			});
	// 		}
	// 		console.log(`[getBars]: returned ${bars.length} bar(s)`);
	// 		onHistoryCallback(bars, {
	// 			noData: false,
	// 		});
	// 	} catch (error) {
	// 		console.log('[getBars]: Get error', error);
	// 		onErrorCallback(error);
	// 	}
	// },
	//
	getBars: async (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
		const { from, to, firstDataRequest } = periodParams;
		// console.log('[getBars]: Method call', symbolInfo, resolution, from, to);
		// const parsedSymbol = parseFullSymbol(symbolInfo.full_name);
		// const urlParameters = {
		// 	e: parsedSymbol.exchange,
		// 	fsym: parsedSymbol.fromSymbol,
		// 	tsym: parsedSymbol.toSymbol,
		// 	toTs: to,
		// 	limit: 2000,
		// };
		// const query = Object.keys(urlParameters)
		// 	.map(name => `${name}=${encodeURIComponent(urlParameters[name])}`)
		// 	.join('&');
		// try {
		// 	const data = await makeApiRequest(`data/histoday?${query}`);
		// 	if (data.Response && data.Response === 'Error' || data.Data.length === 0) {
		// 		// "noData" should be set if there is no data in the requested period
		// 		onHistoryCallback([], {
		// 			noData: true,
		// 		});
		// 		return;
		// 	}
		var reqResolution;

		if (resolution === '1') {
			reqResolution = '1M';
		} else if (resolution === '5') {
			reqResolution = '5M';
		} else if (resolution === '15') {
			reqResolution = '15M';
		} else if (resolution === '30') {
			reqResolution = '30M';
		} else if (resolution === '60') {
			reqResolution = '1H';
		} else if (resolution === '1D') {
			reqResolution = 'D';
		} else if (resolution === '1W') {
			reqResolution = 'W';
		} else if (resolution === '1M') {
			reqResolution = 'M';
		} else {
			console.log("Unsupported resolution!");
		}

		const requestBody = {
			"Ticker": 'BINANCE:BTCUSDT',
			"TimeFrame": reqResolution,
			"from": from,
			"to": to
		};
		const resultData = [];
		try {
			const response = await fetch(url+'/fetchCandleData', {
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
			// if (json.) {
			//
			// }
			// const jsonData = JSON.parse(json);
			json.forEach((entry) => {
				resultData.push(mapObjectFinnhub(entry));
			});

			if (firstDataRequest) {
				lastBarsCache.set('BINANCE:BTCUSDT', {
					...resultData[resultData.length - 1],
				});
			}

			console.log(`[getBars]: returned ${resultData.length} bar(s)`);
			onHistoryCallback(resultData, {
				noData: false,
			});
		} catch (error) {
			console.error('There was an error fetching the candle data:', error);
			throw error; // Re-throw the error for the calling code to handle
		}
		// try {
		//
		// 	let bars = [];
		// 	data.Data.forEach(bar => {
		// 		if (bar.time >= from && bar.time < to) {
		// 			bars = [...bars, {
		// 				time: bar.time * 1000,
		// 				low: bar.low,
		// 				high: bar.high,
		// 				open: bar.open,
		// 				close: bar.close,
		// 			}];
		// 		}
		// 	});
		// 	if (firstDataRequest) {
		// 		lastBarsCache.set(symbolInfo.full_name, {
		// 			...bars[bars.length - 1],
		// 		});
		// 	}
		// 	console.log(`[getBars]: returned ${bars.length} bar(s)`);
		// 	onHistoryCallback(bars, {
		// 		noData: false,
		// 	});
		// } catch (error) {
		// 	console.log('[getBars]: Get error', error);
		// 	onErrorCallback(error);
		// }
	},

	subscribeBars: (
		symbolInfo,
		resolution,
		onRealtimeCallback,
		subscriberUID,
		onResetCacheNeededCallback,
	) => {
		console.log('[subscribeBars]: Method call with subscriberUID:', subscriberUID);
		subscribeOnStream(
			symbolInfo,
			resolution,
			onRealtimeCallback,
			subscriberUID,
			onResetCacheNeededCallback,
			lastBarsCache.get('BINANCE:BTCUSDT'),
		);
	},

	unsubscribeBars: (subscriberUID) => {
		console.log('[unsubscribeBars]: Method call with subscriberUID:', subscriberUID);
		unsubscribeFromStream(subscriberUID);
	},
};
