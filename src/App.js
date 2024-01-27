import './App.css';
import CandleStickChart from './chart/CandleStickChart';
import {getData} from "./util/utils"
import React, {useEffect, useState} from 'react';
import {TypeChooser} from "react-stockcharts/lib/helper";


function App() {

    const [data, setData] = useState([{
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
    },
        {
            "date": new Date("2010-01-03T20:30:00.000Z"),
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

    let objectsArray = [];

    useEffect(() => {
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
        }, 500);
    }, []);


    /* useEffect(() => {
         // Create a new WebSocket instance
         // const newSocket = new WebSocket('wss://socketsbay.com/wss/v2/1/demo/');
         const newSocket = new WebSocket('ws://172.31.13.33:3001');

         console.log(newSocket)
         // Set up event listeners
         newSocket.onopen = () => {
             console.log('WebSocket connection opened');
         };

         newSocket.onerror = (e) => {
             console.log('WebSocket connection error ', e);
         };

         newSocket.onmessage = (event) => {
             console.log('Received message:', event.data);

             setData(parseData(event.data));
         };

         newSocket.onclose = () => {
             console.log('WebSocket connection closed');
         };

         // Save the socket instance to state
         setSocket(newSocket);
         return () => {
             newSocket.close();
         };
     }, []);
 */

    return (
        <div>
            {data ? <TypeChooser>
                {type => <CandleStickChart type={type} data={data}/>}
            </TypeChooser> : <div>Loading...</div>}
        </div>
    );
};

export default App;
