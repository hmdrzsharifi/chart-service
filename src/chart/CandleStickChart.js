import React from "react";
import PropTypes from "prop-types";

import {scaleTime} from "d3-scale";
import {utcDay} from "d3-time";

import {Chart, ChartCanvas} from "react-stockcharts";
import {CandlestickSeries} from "react-stockcharts/lib/series";
import {XAxis, YAxis} from "react-stockcharts/lib/axes";
import {fitWidth} from "react-stockcharts/lib/helper";
import {last, timeIntervalBarWidth} from "react-stockcharts/lib/utils";


class CandleStickChart extends React.Component {

    render() {
        const {type, width, data, ratio} = this.props;
        console.log(data);
        const xAccessor = d => d.date;


        const xExtents = [
            xAccessor(last(data)),
            // xAccessor(data[data.length - 3])
            xAccessor(data[0])
            /*new Date("2010-01-01T20:30:00.000Z"),
            new Date("2010-02-12T20:30:00.000Z")*/
        ];

        return (
            <ChartCanvas height={400}
                         ratio={ratio}
                         width={width}
                         margin={{left: 50, right: 50, top: 10, bottom: 30}}
                         type={type}
                         seriesName="MSFT"
                         data={data}
                         xAccessor={xAccessor}
                         xScale={scaleTime()}
                         xExtents={xExtents}
                // xScale={xScale}

                         mouseMoveEvent={true}
                         panEvent={true}
                         zoomEvent={true}
                         clamp={false}
            >

                <Chart id={1} yExtents={d => [d.high, d.low]} className="dark">
                    <XAxis axisAt="bottom" orient="bottom" ticks={6} tickStroke="#FFFFFF"/>
                    <YAxis axisAt="left" orient="left" ticks={5} tickStroke="#FFFFFF"/>
                    <CandlestickSeries width={timeIntervalBarWidth(utcDay)}
                                       fill={d => d.close > d.open ? "#547863" : "#a30f0f"}
                                       stroke={d => d.close > d.open ? "#6BA583" : "#DB0000"}
                                       wickStroke={d => d.close > d.open ? "#6BA583" : "#DB0000"}
                    />
                </Chart>
            </ChartCanvas>
        );
    }
}

CandleStickChart.propTypes = {
    data: PropTypes.array.isRequired,
    width: PropTypes.number.isRequired,
    ratio: PropTypes.number.isRequired,
    type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
};

CandleStickChart.defaultProps = {
    type: "svg",
};
CandleStickChart = fitWidth(CandleStickChart);

export default CandleStickChart;
