import Datafeed from './datafeed.js';

window.tvWidget = new TradingView.widget({
	symbol: 'BTC_USD',             // Default symbol
	interval: 'D',                         // Default interval
	fullscreen: true,                       // Displays the chart in the fullscreen mode
	container: 'tv_chart_container',        // Reference to an attribute of the DOM element
	datafeed: Datafeed,
	library_path: '../charting_library_cloned_data/charting_library/',
	theme: "Dark",
	charts_storage_api_version: "1.1", // Ensure this is set correctly
	charts_storage_url: 'http://saveload.tradingview.com',
	client_id: 'tradingview.com',
	user_id: 'public_user',
	symbol_search_request_delay: 1,
	enabled_features: [
		'use_localstorage_for_settings',
		'volume_force_overlay',
		'symbol_search_hot_key',
		'header_symbol_search',
		'header_screenshot',
		'header_compare',
		'header_saveload',
		'header_undo_redo',
		'header_settings',
		'header_template'
	],
	timezone:Intl.DateTimeFormat().resolvedOptions().timeZone
	/*time_frames: [
		{ text: "1y", resolution: "1D", description: "1 Year" },
		{ text: "3m", resolution: "1D", description: "3 Months"},
		{ text: "1m", resolution: "1D", description: "1 Month" },
		{ text: "1w", resolution: "60", description: "1 Week" },
		{ text: "1d", resolution: "5", description: "1 Day" },
	]*/
});

