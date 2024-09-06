const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const moment = require('moment');
const NodeCache = require('node-cache');

const cors = require('cors');

const app = express();
app.use(cors());

const cache = new NodeCache({ stdTTL: 86400 });  // Cache for 1 day (86400 seconds)

// Set API key
const apiKey = '71b5ba8cdfb94a71945fa19372efa2bd';

// Use body-parser middleware to parse JSON request bodies
app.use(bodyParser.json());

// Define API endpoint
app.post('/fetchCandleData', async (req, res) => {
    const { ticker, timeFrame, from, to } = req.body;

    // Validate request body
    if (!ticker ||!timeFrame ||!from ||!to) {
        return res.status(400).send({ error: 'Missing required request body parameters' });
    }

    // Map TimeFrame to interval
    const timeFrameMap = {
        'D': '1day',
        '1M': '1min',
        '5M': '5min',
        '15M': '15min',
        '30M': '30min',
        '45M': '45min',
        '1H': '1h',
        '2H': '2h',
        '4H': '4h',
        'W': '1week',
        'M': '1month'
    };

    const interval = timeFrameMap[timeFrame];
    if (!interval) {
        return res.status(400).json({ error: 'Invalid TimeFrame' });
    }

    const fromDate = moment.unix(from).format('YYYY-MM-DD HH:mm:ss');
    // multiply by 1000 to convert to milliseconds
    const toDate = moment.unix(to).format('YYYY-MM-DD HH:mm:ss'); // multiply by 1000 to convert to milliseconds

    // Construct API request URL
    const url = `https://api.twelvedata.com/time_series?start_date=${fromDate}&end_date=${toDate}&timezone=UTC&outputsize=5000&symbol=${ticker}&interval=${interval}&apikey=${apiKey}`;

    try {
        // Make API request to Twelvedata
        const response = await axios.get(url);

        if (response.data.code == 404) {
            console.error(response.data.message);
            res.status(500).send({ error: 'Invalid Symbol' });
        }

        if (response.data.code == 400) {
            console.error(response.data.message);
            res.status(500).send({ error: 'No data is available on the specified dates. Try setting different start/end dates.' });
        }

        // Return response data
        res.json(response.data.values.reverse());
    } catch (error) {
        console.error(error);
        // res.status(500).send({ error: 'Failed to retrieve data from Twelvedata' });
    }
});


// Function to generate cache key
const generateCacheKeyGetAllSymbols = () => 'get_all_symbols';

app.get('/getAllSymbols', async (req, res) => {
    // logger.info('Fetching all symbols.');

    // const url = process.env.SYMBOLS_API_URL;
    const url = "https://cex.intelligentprotocols.com/api/v1/services/all/symbols";
    // const cacheKey = generateCacheKeyGetAllSymbols();

    // Check if data is already cached
   /* const cachedData = cache.get(cacheKey);
    if (cachedData) {
        logger.debug('Returning cached data');
        return res.json(cachedData);
    }*/

    try {
        const response = await axios.get(url);
        const symbols = response.data;

        // logger.debug(`Successfully fetched symbols: ${JSON.stringify(symbols)}`);

        // Store the fetched data in cache
        // cache.set(cacheKey, symbols);

        return res.json(symbols);
    } catch (error) {
        // logger.error(`Error fetching symbols: ${error.message}`);
        return res.status(500).json({ error: 'Failed to fetch symbols' });
    }
});

app.post('/fetchEarnings', (req, res) => {
    try {
        const { ticker, from, to } = req.body;

        if (!ticker ||!from ||!to) {
            // logger.error("Missing required parameters: 'Ticker', 'from', or 'to'");
            return res.status(400).json({ error: "Missing required parameters: 'Ticker', 'from', or 'to'" });
        }

        // const formattedFromDate = convertIsoToDate(from);
        // const formattedToDate = convertIsoToDate(to);
        // const apiKey = process.env.FMP_API_KEY;
        const fromDate = moment.unix(from).format('YYYY-MM-DD HH:mm:ss');
        // multiply by 1000 to convert to milliseconds
        const toDate = moment.unix(to).format('YYYY-MM-DD HH:mm:ss'); // multiply by 1000 to convert to milliseconds

        const url = `https://api.twelvedata.com/earnings?start_date=${fromDate}&end_date=${toDate}&symbol=${ticker}&apikey=${apiKey}`;

        axios.get(url)
            .then(response => {
                if (response.status!== 200) {
                    // logger.error(`Failed to retrieve data: ${response.status} - ${response.data}`);
                    return res.status(response.status).json({ error: "Failed to retrieve data" });
                }

                const data = response.data;
                if (data.code==404) {
                    return res.json("");
                }
                // logger.info(`Successfully fetched and filtered earnings data for ${symbol}`);
                return res.json(data.earnings);
            })
            .catch(error => {
                // logger.error(`An error occurred: ${error.message}`);
                return res.status(500).json({ error: "An internal error occurred" });
            });
    } catch (error) {
        // logger.error(`An error occurred: ${error.message}`);
        return res.status(500).json({ error: "An internal error occurred" });
    }
});

app.post('/fetchDividends', (req, res) => {
    try {
        const { ticker, from, to } = req.body;

        if (!ticker ||!from ||!to) {
            // logger.error("Missing required parameters: 'Ticker', 'from', or 'to'");
            return res.status(400).json({ error: "Missing required parameters: 'Ticker', 'from', or 'to'" });
        }

        // const formattedFromDate = convertIsoToDate(from);
        // const formattedToDate = convertIsoToDate(to);
        // const apiKey = process.env.FMP_API_KEY;
        const fromDate = moment.unix(from).format('YYYY-MM-DD HH:mm:ss');
        // multiply by 1000 to convert to milliseconds
        const toDate = moment.unix(to).format('YYYY-MM-DD HH:mm:ss'); // multiply by 1000 to convert to milliseconds

        const url = `https://api.twelvedata.com/dividends?start_date=${fromDate}&end_date=${toDate}&symbol=${ticker}&apikey=${apiKey}`;

        axios.get(url)
            .then(response => {
                if (response.status!== 200) {
                    // logger.error(`Failed to retrieve data: ${response.status} - ${response.data}`);
                    return res.status(response.status).json({ error: "Failed to retrieve data" });
                }


                const data = response.data;
                if (data.code==404) {
                    return res.json("");
                }
                // logger.info(`Successfully fetched and filtered earnings data for ${symbol}`);
                return res.json(data.dividends);
            })
            .catch(error => {
                // logger.error(`An error occurred: ${error.message}`);
                return res.status(500).json({ error: "An internal error occurred" });
            });
    } catch (error) {
        // logger.error(`An error occurred: ${error.message}`);
        return res.status(500).json({ error: "An internal error occurred" });
    }
});

// Start server
const port = 6001;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});