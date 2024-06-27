import React, {useEffect, useRef, useState} from 'react';
import './App.css';
import {StockChart} from "./chart/StockChart";

import Toolbar from "./layout/toolbar";
import Footer from "./layout/footer";
import Sidebar from "./layout/sidebar";
import {NO_OF_CANDLES, WEBSOCKET_ADDRESS} from "./config/constants";
import {createTheme, CssBaseline, ThemeProvider} from '@mui/material';
import useStore from "./util/store";
import {fetchCandleData} from "./util/utils";
import io from 'socket.io-client';
import useDesignStore from "./util/designStore";
import getDesignTokens from "./config/theme";
import Decimal from 'decimal.js';
import {MainChart} from "./chart/MainChart";
// @ts-ignore
import useDimensions from 'react-use-dimensions'
// @ts-ignore
import {BlinkBlur, Slab} from "react-loading-indicators";

function App() {

    const [ref, { width, height }] = useDimensions()

    const [data, setData] = useState<any>([]);
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
            await fetchInitialData();
            connectWebSocket(newSocket);
        };
        fetchDataAndConnectWebSocket();

        // Cleanup function
        return () => {
            console.log("******************* cleanup")
            newSocket.disconnect(); // Disconnect the socket
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
                handleRealTimeCandle(convertedMessage)
            }
        });

        // CEX
        socket.on('symbolUpdate', (message: any) => {
            // console.log(message)
            const convertedMessage = {...message, ask: new Decimal(message.ask).toNumber()}

            let rawData = symbol.split(':')
            let rawSymbol
            if (rawData[0] == 'BINANCE') {
                rawSymbol = rawData[1].replace('USDT','_USD')
            }
            if (rawData[0] == 'OANDA') {
                rawSymbol = rawData[1]
            }
            if (message.symbol === rawSymbol) {
                handleRealTimeCandleCex(convertedMessage)
            }
        });

    };

    const handleRealTimeCandleCex = (dataFeed: any) => {
        const lastCandlestick = stateDataRef.current[stateDataRef.current.length - 1];

        let resolution

        switch (timeFrame) {
            case "1M":
                resolution = 1
                break;
            case "5M":
                resolution = 5
                break;
            case "15M":
                resolution = 15
                break;
            case "30M":
                resolution = 30
                break;
            case "1H":
                resolution = 60
                break;
            case "D":
                // 1 day in minutes === 1440
                resolution = 1440
                break;
            case "W":
                // 1 week in minutes === 10080
                resolution = 10080
                break;
            case "M":
                // 1 month (31 days) in minutes === 44640
                //todo for month 30 and 31 days
                resolution = 44640
                break;

            default:
                // 1 day in minutes === 1440
                resolution = 1440
        }

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

    const handleRealTimeCandle = (dataFeed: any) => {
        const lastCandlestick = stateDataRef.current[stateDataRef.current.length - 1];

        let resolution

        switch (timeFrame) {
            case "1M":
                resolution = 1
                break;
            case "5M":
                resolution = 5
                break;
            case "15M":
                resolution = 15
                break;
            case "30M":
                resolution = 30
                break;
            case "1H":
                resolution = 60
                break;
            case "D":
                // 1 day in minutes === 1440
                resolution = 1440
                break;
            case "W":
                // 1 week in minutes === 10080
                resolution = 10080
                break;
            case "M":
                // 1 month (31 days) in minutes === 44640
                //todo for month 30 and 31 days
                resolution = 44640
                break;

            default:
                // 1 day in minutes === 1440
                resolution = 1440
        }

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
            let from;

            setLoading(true)

            switch (timeFrame) {
                case "1M":
                    from = Math.floor(new Date().getTime() / 1000) - (NO_OF_CANDLES * 60);
                    break;
                case "D":
                    from = Math.floor(new Date().getTime() / 1000) - (NO_OF_CANDLES * 24 * 3600);
                    break;

                //todo add other time frame

                default:
                    from = Math.floor(new Date().getTime() / 1000) - (NO_OF_CANDLES * 24 * 3600)
            }

            console.log({symbol})
            const candleData = await fetchCandleData(symbol, timeFrame, from, Math.floor(new Date().getTime() / 1000));

            setData(candleData)
            setReloadFromSymbol(!reloadFromSymbol)
            setLoading(false)

        } catch (error) {
            console.error('Error fetching candle data:', error);
            setError(true)
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
                                <div className={'loader-wrapper'} style={{ width: width ? width - (openSideBar ? 40 : 0) : 0, height: height ? height : 0 }}>
                                    <BlinkBlur color="#f3cc00" size="medium" text="Loading..." textColor="" />
                            </div>}
                            {error ? <div className="error-message">Failed to fetch</div> :
                                data.length > 0 && <MainChart dataList={data} width={width ? width - (openSideBar ? 45 : 10) : 0} ratio={3}
                                                              reloadFromSymbol={reloadFromSymbol}
                                                           theme={theme} height={height ? height : 0}
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
