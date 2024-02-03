import './App.css';
import React, {useEffect, useState} from 'react';
import CandleStickChart from './chart/CandleStickChart';
import {TypeChooser} from "react-stockcharts/lib/helper";
import {getData, getWebsocketData} from "./util/utils"
import Toolbar from "./layout/toolbar";
import Footer from "./layout/footer";
import Sidebar from "./layout/sidebar";

const WS_URL = 'ws://192.168.95.128:8002';

function App() {
    let objectsArray = [];
    const [data, setData] = useState([{
        "date": new Date("2024-01-18T20:30:00.000Z"),
        "open": 41707.43466188,
        "high": 41707.61456186,
        "low": 41705.42745523,
        "close": 41707.6104254,
        "volume": 17.31974415999999,
        "split": "",
        "dividend": "",
        "absoluteChange": "",
        "percentChange": ""
    }, {
        "date": new Date("2024-01-19T20:30:00.000Z"),
        "open": 41707.6069605,
        "high": 41710.92123529,
        "low": 41707.60412071,
        "close": 41710.91156571,
        "volume":13.326220460000009,
        "split": "",
        "dividend": "",
        "absoluteChange": "",
        "percentChange": ""
    },
        {
            "date": new Date("2024-01-20T20:30:00.000Z"),
            "open": 25.65226505944465,
            "high": 25.81840750861228,
            "low": 25.353210976925574,
            "close": 25.560888,
            "volume": 58182400,
            "split": "",
            "dividend": "",
            "absoluteChange": "",
            "percentChange": ""
        }]);


    useEffect(() => {
        const socket = new WebSocket(WS_URL);
        socket.onopen = () => {
            console.log('WebSocket connection opened');
            // hm.send("Hello");
        };

        socket.onmessage = (event) => {
            console.log('Received message: ' , event.data);
            let originalData = JSON.parse(event.data);

            // Convert timestamp to date string
            let date = new Date(originalData.t);
            // Create the target format
            let convertedData = {
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

            objectsArray.push(convertedData);
            // let date = new Date(parsedData.t);
            // let candle = parseEODData(parsedData);

            // console.log('Received message: ' , JSON.parse(event.data, parseEODData(parseDate)))
            // console.log('Received message: ' , parseEODData(parsedData))
            console.log('Candle: ' ,convertedData)

            /*objectsArray = objectsArray.concat([{
                "date": new Date("2010-01-01T20:30:00.000Z"),
                "open": 25.436282332605284,
                "high": 25.835021381744056,
                "low": 25.411360259406774,
                "close": 25.710416,
                "volume": 38409100,
                "split": "",
                "dividend": "",
                "absoluteChange": "",
                "percentChange": ""
            }, {
                "date": new Date("2010-01-02T20:30:00.000Z"),
                "open": 25.627344939513726,
                "high": 25.83502196495549,
                "low": 25.452895407434543,
                "close": 25.718722,
                "volume": 49749600,
                "split": "",
                "dividend": "",
                "absoluteChange": "",
                "percentChange": ""
            }]);*/
            // objectsArray = objectsArray.concat(convertedData)
            // console.log(objectsArray)
            setData([...data, ...objectsArray])
        }

        socket.onerror = (error) => {
            console.log('message error');
        }

        socket.onerror = () => {
            console.log('connection closed');
        }
    }, []);

    useEffect(() => {
        console.log('data: ', data)
    }, [data]);

    useEffect(() => {
        // getWebsocketData()
        getData().then(data => {
            // setData(data))
        })

        const dates = [
            "2010-01-04T20:30:00.000Z",
            "2010-01-05T20:30:00.000Z",
            "2010-01-06T20:30:00.000Z",
            "2010-01-07T20:30:00.000Z",
            "2010-01-08T20:30:00.000Z",
            "2010-01-09T20:30:00.000Z",
            "2010-01-10T20:30:00.000Z",
            "2010-01-11T20:30:00.000Z",
            "2010-01-12T20:30:00.000Z",
            "2010-01-13T20:30:00.000Z",
            "2010-01-14T20:30:00.000Z",
            "2010-01-15T20:30:00.000Z",
            "2010-01-16T20:30:00.000Z",
            "2010-01-17T20:30:00.000Z",
            "2010-01-18T20:30:00.000Z",
            "2010-01-19T20:30:00.000Z",
            "2010-01-20T20:30:00.000Z",
            "2010-01-21T20:30:00.000Z",
            "2010-01-22T20:30:00.000Z",
            "2010-01-23T20:30:00.000Z",
            "2010-01-24T20:30:00.000Z",
            "2010-01-25T20:30:00.000Z",
            "2010-01-26T20:30:00.000Z",
            "2010-01-27T20:30:00.000Z",
            "2010-01-28T20:30:00.000Z",
            "2010-01-29T20:30:00.000Z",
            "2010-01-30T20:30:00.000Z",
            "2010-02-01T20:30:00.000Z",
            "2010-02-02T20:30:00.000Z",
            "2010-02-03T20:30:00.000Z",
        ]
        let index = 1
        setInterval(function () {
            objectsArray = objectsArray.concat([{
                "date": new Date(dates[index++]),
                "open": 25.436282332605284,
                "high": 25.835021381744056,
                "low": 25.411360259406774,
                "close": 25.710416,
                "volume": 38409100,
                "split": "",
                "dividend": "",
                "absoluteChange": "",
                "percentChange": ""
            }, {
                "date": new Date(dates[index++]),
                "open": 25.627344939513726,
                "high": 25.83502196495549,
                "low": 25.452895407434543,
                "close": 25.718722,
                "volume": 49749600,
                "split": "",
                "dividend": "",
                "absoluteChange": "",
                "percentChange": ""
            },
                {
                    "date": new Date(dates[index++]),
                    "open": 25.65226505944465,
                    "high": 25.81840750861228,
                    "low": 25.353210976925574,
                    "close": 25.560888,
                    "volume": 58182400,
                    "split": "",
                    "dividend": "",
                    "absoluteChange": "",
                    "percentChange": ""
                }])
            setData(objectsArray);
        }, 5000);
    }, []);

    return (
        <div className="app-container">
            <Toolbar/>
            <div className="chart-container">
                <Sidebar/>
                <div className="chart" style={{width: '100%'}}>
                    {data ? <TypeChooser>
                        {type => <CandleStickChart type={type} height={600} data={data}/>}
                    </TypeChooser> : <div>Loading...</div>}
                </div>
            </div>
            <Footer/>
        </div>
    );
};

export default App;
