import React, {useEffect, useRef, useState} from 'react';
import './App.css';
import {StockChart} from "./chart/StockChart";

import Toolbar from "./layout/toolbar";
import Footer from "./layout/footer";
import Sidebar from "./layout/sidebar";
import {NO_OF_CANDLES, WEBSOCKET_ADDRESS} from "./config/constants";
import {createTheme, CssBaseline, ThemeProvider} from '@mui/material';
import useStore from "./util/store";
import {fetchCandleDataFinnhub, fetchCandleDataFMP} from "./util/utils";
import io from 'socket.io-client';
import useDesignStore from "./util/designStore";
import getDesignTokens from "./config/theme";
import Decimal from 'decimal.js';
import {MainChart} from "./chart/MainChart";

// @ts-ignore
import useDimensions from 'react-use-dimensions'
// @ts-ignore
import {BlinkBlur} from "react-loading-indicators";
import finnhubSymbols from './finnhub-symbols.json';
import {IOHLCData} from "./data";


function App() {

    const [ref, {width, height}] = useDimensions();

    const [data, setData] = useState<IOHLCData[]>([]);
    const [last, setLast] = useState<IOHLCData | null>(null);
    const [lastTime, setLastTime] = useState<any>(new Date());
    const [reloadFromSymbol, setReloadFromSymbol] = useState(false);
    const {symbol, timeFrame} = useStore();
    const {openSideBar, themeMode} = useDesignStore();
    const {loading, setLoading} = useDesignStore();
    const {error, setError} = useStore();
    const {setChartDimensions} = useStore();


    useEffect(() => {
        setChartDimensions({width, height})
    }, [width, height])


    const stateRef: React.MutableRefObject<any> = useRef();
    stateRef.current = lastTime;

    const stateDataRef: React.MutableRefObject<any> = useRef();
    stateDataRef.current = data;

    useEffect(() => {
        // Initialize socket connection
        const newSocket = io(WEBSOCKET_ADDRESS);

        const fetchDataAndConnectWebSocket = async () => {
            try {
                await fetchInitialData();
                connectWebSocket(newSocket);
            } catch (error) {
                console.error('Error in fetching data or connecting WebSocket:', error);
            }
        };
        fetchDataAndConnectWebSocket();

        // Cleanup function
        return () => {
            console.log("******************* cleanup")
            newSocket.disconnect();
        };
    }, [symbol, timeFrame]);

    const connectWebSocket = async (socket: any) => {

        socket.on('connect', () => {
            console.log('Connected to server');
            console.log('******************* symbol: ', symbol)
            const msg = {
                symbol: symbol
            }
            socket.emit('message', msg);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        socket.on('message', (message: any) => {
            // console.log('Received message:', message);
            const convertedMessage = {...message, p: new Decimal(message.p).toNumber()}
            if (message.s === symbol) {
                // handleRealTimeCandle(convertedMessage);
                // setReloadFromSymbol(prevState => !prevState);
                setLast(message)
            }
        });

        // CEX
        socket.on('symbolUpdate', (message: any) => {
            // console.log('Received message CEX:', message);

            /*const convertedMessage = {...message, ask: new Decimal(message.ask).toNumber()}
            let rawData = symbol.split(':')
            let rawSymbol
            if (rawData[0] === 'BINANCE') {
                rawSymbol = rawData[1].replace('USDT','_USD')
            }
            if (rawData[0] === 'OANDA') {
                rawSymbol = rawData[1]
            }*/

            if (message.symbol === symbol) {
                // handleRealTimeCandleCex(message);
                // setReloadFromSymbol(prevState => !prevState);
                setLast(message)
            }
        });
    };

    const handleRealTimeCandleCex = (dataFeed: any) => {
        const lastCandlestick = stateDataRef.current[stateDataRef.current.length - 1];
        const resolution = getResolution(timeFrame);

        // @ts-ignore
        let coeff = resolution * 60
        // Round the time to the nearest minute, Change as per your resolution
        // @ts-ignore
        let rounded = Math.floor((dataFeed.timestamp / 1000) / coeff) * coeff
        let lastBarSec = lastCandlestick.date.getTime() / 1000
        let _lastBar

        if (rounded > lastBarSec) {
            // create a new candle, use last close as open
            _lastBar = {
                date: new Date(rounded * 1000),
                open: dataFeed.ask,
                high: dataFeed.ask,
                low: dataFeed.ask,
                close: dataFeed.ask,
                volume: dataFeed.volume
            }
            setData([...stateDataRef.current, _lastBar]);

        } else {
            // update last candle! candle still open just modify it
            lastCandlestick.high = dataFeed.ask > lastCandlestick.high ? dataFeed.ask : lastCandlestick.high;
            lastCandlestick.low = dataFeed.ask < lastCandlestick.low ? dataFeed.ask : lastCandlestick.low;
            lastCandlestick.volume += dataFeed.volume
            lastCandlestick.close = dataFeed.ask
            _lastBar = lastCandlestick

            setData([...stateDataRef.current.slice(0, -1), _lastBar]);
        }
    }

    const getResolution = (timeFrame: string) => {
        switch (timeFrame) {
            case "1M": return 1;
            case "5M": return 5;
            case "15M": return 15;
            case "30M": return 30;
            case "1H": return 60;
            case "D": return 1440; // 1 day in minutes === 1440
            case "W": return 10080;
            case "M": return 44640;
            default: return 1440;
        }
    };

    const handleRealTimeCandle = (dataFeed: any) => {
        const lastCandlestick = stateDataRef.current[stateDataRef.current.length - 1];
        const resolution = getResolution(timeFrame);

        // @ts-ignore
        let coeff = resolution * 60
        // Round the time to the nearest minute, Change as per your resolution
        // @ts-ignore
        let rounded = Math.floor((dataFeed.t / 1000) / coeff) * coeff
        let lastBarSec = lastCandlestick.date.getTime() / 1000
        let _lastBar

        if (rounded > lastBarSec) {
            // create a new candle, use last close as open
            _lastBar = {
                date: new Date(rounded * 1000),
                open: dataFeed.p,
                high: dataFeed.p,
                low: dataFeed.p,
                close: dataFeed.p,
                volume: dataFeed.v
            }
            setData([...stateDataRef.current, _lastBar]);

        } else {
            // update last candle! candle still open just modify it
            lastCandlestick.high = dataFeed.p > lastCandlestick.high ? dataFeed.p : lastCandlestick.high;
            lastCandlestick.low = dataFeed.p < lastCandlestick.low ? dataFeed.p : lastCandlestick.low;
            lastCandlestick.volume += dataFeed.v
            lastCandlestick.close = dataFeed.p
            _lastBar = lastCandlestick

            setData([...stateDataRef.current.slice(0, -1), _lastBar]);
        }
    }

    const fetchInitialData = async () => {
        try {
            if (finnhubSymbols.hasOwnProperty(symbol)) {
                console.log("fetchInitialDataFinnhub", symbol)
                await fetchInitialDataFinnhub(symbol)
            } else {
                let ticker = symbol.replace('_USD', 'USD').toLowerCase();
                console.log("fetchInitialDataFMP", ticker)
                await fetchInitialDataFMP(ticker)
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error; // Rethrow error to be caught in the outer try-catch block
        }
    };

    const fetchInitialDataFinnhub = async (ticker: any) => {
        try {
            setLoading(true)

            const multipliers = {
                "1M": 60,
                "5M": 5 * 60,
                "15M": 15 * 60,
                "30M": 30 * 60,
                "1H": 60 * 60,
                "D": 24 * 3600,
                "W": 7 * 24 * 3600,
                "M": 30 * 24 * 3600
            };

            const multiplier = multipliers[timeFrame];
            const from = Math.floor(new Date().getTime() / 1000) - (NO_OF_CANDLES * multiplier);
            const to = Math.floor(new Date().getTime() / 1000);

            const candleData = await fetchCandleDataFinnhub(ticker, timeFrame, from, to);

            setData(candleData)
            setReloadFromSymbol(!reloadFromSymbol)
            setLoading(false)

        } catch (error) {
            console.error('Error fetching candle data:', error);
            setError(true)
        }
    };

    const fetchInitialDataFMP = async (ticker: any) => {
        try {
            setLoading(true)

            const multipliers = {
                "1M": 60,
                "5M": 5 * 60,
                "15M": 15 * 60,
                "30M": 30 * 60,
                "1H": 60 * 60,
                "D": 24 * 3600,
                "W": 7 * 24 * 3600,
                "M": 30 * 24 * 3600
            };

            const multiplier = multipliers[timeFrame];
            const from = Math.floor(new Date().getTime() / 1000) - (NO_OF_CANDLES * multiplier);
            const to = Math.floor(new Date().getTime() / 1000);

            const candleData = await fetchCandleDataFMP(ticker, timeFrame, from, to);
            console.log(candleData)

            setData(candleData)
            setReloadFromSymbol(!reloadFromSymbol)
            setLoading(false)

        } catch (error) {
            console.error('Error fetching candle data:', error);
            setError(true)
            throw error; // Rethrow error to be caught in the outer try-catch block
        }
    };


    const theme = React.useMemo(() => createTheme(getDesignTokens(themeMode)), [themeMode]);

    if (data == null) {
        return <div>Loading...</div>;
    }

    const getWidth = () => {
        const width = openSideBar ? 45 : 10
        return window.innerWidth - width
    }

    return (
        <>
            <ThemeProvider theme={theme}>
                <CssBaseline/>
                <div className="app-container">
                    <Toolbar
                        style={{
                            borderBottom: 'solid 1px',
                            background: getDesignTokens(themeMode).palette.backgroundBar,
                            borderColor: getDesignTokens(themeMode).palette.borderBar
                        }}
                        fetchInitialData={fetchInitialData}
                    />
                    <div className="chart-container">
                        <Sidebar style={{
                            borderRight: 'solid 1px',
                            width: openSideBar ? '40px' : '0',
                            background: getDesignTokens(themeMode).palette.backgroundBar,
                            borderColor: getDesignTokens(themeMode).palette.borderBar
                        }}/>
                        <div className="chart" id="chartId" ref={ref} style={{
                            width: '100%',
                            background: getDesignTokens(themeMode).palette.chartBackground
                        }}>
                            {loading && !error &&
                                <div className={'loader-wrapper'} style={{
                                    width: width ? width - (openSideBar ? 40 : 0) : 0,
                                    height: height ? height : 0
                                }}>
                                    <BlinkBlur color="#f3cc00" size="medium" text="Loading..." textColor=""/>
                                </div>}
                            {error ? <div className="error-message">Failed to fetch</div> :
                                data.length > 0 &&
                                <MainChart dataList={data} width={width ? width - (openSideBar ? 45 : 10) : 0} ratio={3}
                                           reloadFromSymbol={reloadFromSymbol}
                                           theme={theme} height={height ? height : 0} last={last}
                                />}

                            {/*{error ? <div className="error-message">Failed to fetch</div> :  <StockChart data={stateDataRef.current} setData={setData} theme={theme}
                                                            height={window.innerHeight - 100}
                                                            ratio={3}
                                                            width={getWidth()}/>
                            }*/}

                        </div>
                    </div>
                    <Footer style={{
                        borderTop: 'solid 1px',
                        background: getDesignTokens(themeMode).palette.backgroundBar,
                        borderColor: getDesignTokens(themeMode).palette.borderBar
                    }}/>
                </div>
            </ThemeProvider>
        </>
    );
}

export default App;
