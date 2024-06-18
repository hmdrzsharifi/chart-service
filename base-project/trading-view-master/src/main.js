import Datafeed from './datafeed.js';

window.tvWidget = new TradingView.widget({
	symbol: 'BTC_USD',             // Default symbol
	interval: 'D',                         // Default interval
	fullscreen: true,                       // Displays the chart in the fullscreen mode
	container: 'tv_chart_container',        // Reference to an attribute of the DOM element
	datafeed: Datafeed,
	library_path: '../charting_library_cloned_data/charting_library/',
	theme: "Dark",
	charts_storage_api_version: "1.0", // Ensure this is set correctly
	charts_storage_url: 'http://127.0.0.1:5000',
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
		'header_template',
		"left_toolbar",
		"header_layouttoggle",
		"support_multicharts",
		"chart_template_storage",
		"insert_indicator_dialog_shortcut"
	],
	/*	disabled_features: ["use_localstorage_for_settings"
		, "header_symbol_search",
	],*/
	timezone:Intl.DateTimeFormat().resolvedOptions().timeZone
	/*time_frames: [
		{ text: "1y", resolution: "1D", description: "1 Year" },
		{ text: "3m", resolution: "1D", description: "3 Months"},
		{ text: "1m", resolution: "1D", description: "1 Month" },
		{ text: "1w", resolution: "60", description: "1 Week" },
		{ text: "1d", resolution: "5", description: "1 Day" },
	]*/
});

// add custom button to header
/*window.tvWidget.onChartReady(function() {
	// Create the custom button
	var button = window.tvWidget.createButton();
	button.setAttribute('title', 'Custom Button');
	button.innerHTML = 'Custom Button';
	button.addEventListener('click', function() {
		alert('Custom button clicked!');
	});
});*/
