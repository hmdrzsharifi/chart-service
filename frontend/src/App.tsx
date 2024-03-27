import React, {useEffect, useRef, useState} from 'react';
import './App.css';
import {StockChart} from "./chart/StockChart";

// import {fetchCandleData, getWebsocketData} from "./util/utils"
import Toolbar from "./layout/toolbar";
import Footer from "./layout/footer";
import Sidebar from "./layout/sidebar";
import {WEBSOCKET_ADDRESS} from "./config/constants";
import {createTheme, CssBaseline, ThemeProvider} from '@mui/material';
import useStore from "./util/store";
import {fetchCandleData} from "./util/utils";
import io from 'socket.io-client';
import userEvent from "@testing-library/user-event";


function App() {

    const [data, setData] = useState<any>([]);
    // const [counter, setCounter] = useState(0);

    const {themeMode, symbol, timeFrame} = useStore();
    // const [socket, setSocket] = useState(new WebSocket(WEBSOCKET_ADDRESS))
    const [socket, setSocket] = useState();

    useEffect(() => {
        // Connect to the server
        const newSocket = io(WEBSOCKET_ADDRESS);

        // Set up event handlers
        newSocket.on('connect', () => {
            console.log('Connected to server');
            // todo for various timeframes
            const msg = {
                symbol: symbol,
                timeFrame: '5s'
            }

            newSocket.emit('message', msg);

            /*  setInterval(() => {
                  newSocket.emit('message', msg);
              }, 5000);*/
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        newSocket.on('message', (message: any) => {
            console.log('Received message:', message);
            // handleNewTick(data)
            //lastCandle = data[data.length];

            handleRealTimeTick(message)

        });

        // Remember to disconnect the socket when the component unmounts
        return () => {
            newSocket.disconnect();
        };
    }, [symbol, timeFrame]);


    const handleRealTimeTick = (message: any) => {
        let originalData = JSON.parse(message.server_message);
        let date = new Date(originalData.t * 1000);
        let newCandle = {
            "date": date,
            "open": parseFloat(originalData.o),
            "high": parseFloat(originalData.h),
            "low": parseFloat(originalData.l),
            "close": parseFloat(originalData.c),
            "volume": parseFloat(originalData.v),
            "split": "",
            "dividend": "",
            "absoluteChange": "",
            "percentChange": ""
        };

        // console.log("lastCand", data[data.length-1])
        console.log("lastCand_date", data[data.length-1]?.date)
        console.log("websocket_candle", newCandle.date)
        console.log({data})

        if (data[data.length-1]?.date.getMinutes() == newCandle?.date.getMinutes()) {
            console.log("update")
            // console.log({counter})
            // setCounter(counter  => ({ ...counter , a: counter.a + 1 }));
            setData((data: any[]) => [...data.slice(0, data.length - 1), newCandle])
        } else {
            console.log("new")
            // console.log({counter})
            // setCounter(counter  => ({ ...counter , a: counter.a + 1 }));
            setData((data: any[]) => [...data, newCandle])
        }
    }

/*
    function useInterval(callback: any, delay:any) {
        const savedCallback = useRef();

        // Remember the latest callback.
        useEffect(() => {
            savedCallback.current = callback;
        }, [callback]);

        // Set up the interval.
        useEffect(() => {
            function tick() {
                // @ts-ignore
                savedCallback.current();
            }
            if (delay !== null) {
                let id = setInterval(tick, delay);
                return () => clearInterval(id);
            }
        }, [delay]);
    }

    useInterval(() => {
       console.log({counter})
        // setCounter(counter+1)
    }, 1000);
*/

/*    useEffect(() =>{
        console.log("{data}", data[data.length-1])
        }
    , [data])*/

    function generateFakeData() {
        setInterval(() => {
            setData((data: any[]) => [...data.slice(0, data.length - 1),
                {
                    "date": new Date("1970-01-20T15:15:50.400Z"),
                    "open": Math.random() * 170,
                    "high": Math.random() * 170,
                    "low": Math.random() * 170,
                    "close": Math.random() * 170,
                    "volume": 57266675,
                    // "open": 173.8,
                    // "high": 177.99,
                    // "low": 173.18,
                    // "close": 177.49,
                    // "volume": 57266675,

                }])
        }, 1000);
    }

    useEffect(() => {
        // connectWebSocket();
        fetchInitialData();

        // generateFakeData();
    }, [symbol, timeFrame]); // Only on mount and unmount

    /*    useEffect(() => {
            // if (ticker === 'BINANCE:BTCUSDT' || ticker === 'BINANCE:ETHUSDT') {
            const socket = new WebSocket('wss://ws.finnhub.io?token=co1c0lhr01qgulhr2shgco1c0lhr01qgulhr2si0');

            socket.onopen = () => {
                console.log('WebSocket connection opened');
                socket.send(JSON.stringify({'type': 'subscribe', 'symbol': 'AAPL'}));
                // socket.send("subscribe:" + symbol);
            };
            socket.onmessage = (event) => {
                console.log('WebSocket Message: ', event.data);
                // handleNewTick(event.data);
            };
            socket.onerror = (error) => {
                console.error('WebSocket Error:', error);
            };
            socket.onerror = () => {
                console.log('WebSocket Disconnected');
            };

        }, []);*/


    /*const connectWebSocket = async () => {
      /!*  ws.current = new WebSocket(WS_URL);
        ws.current.onopen = () => {
            console.log("WebSocket connected");
            ws.current.send("subscribe:" + symbol);
        };
        ws.current.onmessage = (event) => {
            handleNewTick(event.data);
        };
        ws.current.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };
        ws.current.onclose = () => {
            console.log('WebSocket Disconnected');
        };*!/

      // const socket = new WebSocket(WEBSOCKET_ADDRESS);
      socket.onopen = () => {
        console.log('WebSocket connection opened');
        // socket.send("subscribe:" + symbol);
      };
      socket.onmessage = (event) => {
        handleNewTick(event.data);
      };
      socket.onerror = (error) => {
        console.error('WebSocket Error:', error);
      };
      socket.onerror = () => {
        console.log('WebSocket Disconnected');
      };
    };
*/
    const handleNewTick = (message: any) => {
        /*const cleanedMessage = message.replace(/\[|\]/g, '');
        const lastHyphenIndex = cleanedMessage.lastIndexOf("-");
        const ltp = parseFloat(cleanedMessage.substring(lastHyphenIndex + 1));
        lastTickPrice.current = ltp;*/

        setData((prevData: any) => {
            if (!prevData || prevData.length === 0) return null;
            const newData = [...prevData];
            const lastCandle = {...newData[newData.length - 1]};
            const currentTime = new Date();

            // Calculate the start time for the next candle based on the last candle's date
            // const timeFrameMinutes = parseInt(timeFrame.replace('minute', ''), 10);
            const nextCandleStartTime = new Date(lastCandle.date);
            // nextCandleStartTime.setMinutes(nextCandleStartTime.getMinutes() + timeFrameMinutes);

            if (currentTime >= nextCandleStartTime) {
                // Time to start a new candle
                console.log("appending new candle");
                console.log("appending new candle", message);
                // let originalData = JSON.parse(message);
                let originalData = JSON.parse(message.server_message);
                let date = new Date(originalData.t);
                let newCandle = {
                    "date": date,
                    "open": parseFloat(originalData.o),
                    "high": parseFloat(originalData.h),
                    "low": parseFloat(originalData.l),
                    "close": parseFloat(originalData.c),
                    "volume": parseFloat(originalData.v),
                    "split": "",
                    "dividend": "",
                    "absoluteChange": "",
                    "percentChange": ""
                };

                /*const newCandle = {
                    date: nextCandleStartTime,
                    open: ltp,
                    high: ltp,
                    low: ltp,
                    close: ltp,
                    volume: 0 // Adjust the volume as necessary
                };*/
                newData.push(newCandle);
            } else {
                // Update the last candle with the new LTP
                // lastCandle.close = ltp;
                // lastCandle.high = Math.max(lastCandle.high, ltp);
                // lastCandle.low = Math.min(lastCandle.low, ltp);
                newData[newData.length - 1] = lastCandle;
            }

            return newData;
        });
    };

    const fetchInitialData = async () => {
        /*const toDate = new Date();
        toDate.setHours(23, 59, 59, 999);
        const fromDate = new Date();
        fromDate.setHours(0, 0, 0, 0);
        fromDate.setDate(toDate.getDate() - 40); // Subtract 7 days

        const toDateString = formatLocalDate(toDate);
        const fromDateString = formatLocalDate(fromDate);
        console.log("Fetching data", symbol, toDateString);*/

        try {
            // const candleData = await fetchCandleData(symbol, timeFrame, fromDateString, toDateString);
            // const candleData = await fetchCandleData(symbol, durationData, new Date(new Date().setDate(new Date().getDate() - 151)).toLocaleDateString("sv-SE"), new Date().toLocaleDateString("sv-SE"));
            const candleData = await fetchCandleData(symbol, timeFrame, Math.floor(new Date().getTime() / 1000) - (150 * 24 * 3600), Math.floor(new Date().getTime() / 1000));
            // const candleData = await fetchCandleData(symbol, "d", "2023-08-20", "2024-02-03");
            console.log(candleData)

            setData(candleData)
        } catch (error) {
            console.error('Error fetching candle data:', error);
        }
    };


    const theme = createTheme({
        palette: {
            mode: themeMode,
        },
    });

    const backGroundColor = {
        background: theme.palette.mode === 'dark' ? '#0080e7' : '#90caf9',
        borderColor: theme.palette.mode === 'dark' ? '#90caf9' : '#0080e7',
    }


    if (data == null) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <ThemeProvider theme={theme}>
                <CssBaseline/>
                <div className="app-container">
                    <Toolbar style={{
                        borderBottom: 'solid 3px',
                        ...backGroundColor
                    }}/>
                    <div className="chart-container">
                        <Sidebar style={{
                            borderRight: 'solid 1px',
                            ...backGroundColor
                        }}/>
                        <div className="chart" style={{width: '100%'}}>
                            <StockChart data={data} setData={setData} theme={theme} height={window.innerHeight - 100}
                                        ratio={3}
                                        width={window.innerWidth - 45}/>
                        </div>
                    </div>
                    <Footer style={{
                        borderTop: 'solid 3px',
                        ...backGroundColor
                    }}/>
                </div>
            </ThemeProvider>
        </>
    );
}

export default App;
