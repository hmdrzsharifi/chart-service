// Datafeed implementation
import Datafeed from './datafeed.js';

window.tvWidget = new TradingView.widget({
	symbol: 'BTC_USD',             // Default symbol
	interval: 'D',                         // Default interval
	fullscreen: true,                       // Displays the chart in the fullscreen mode
	container: 'tv_chart_container',        // Reference to an attribute of the DOM element
	datafeed: Datafeed,
	library_path: '../charting_library_cloned_data/charting_library/',
	/*time_frames: [
		{ text: "1y", resolution: "1D", description: "1 Year" },
		{ text: "3m", resolution: "1D", description: "3 Months"},
		{ text: "1m", resolution: "1D", description: "1 Month" },
		{ text: "1w", resolution: "60", description: "1 Week" },
		{ text: "1d", resolution: "5", description: "1 Day" },
		{ text: "1000y", resolution: "1D", description: "All", title: "All" }
	]*/
});
