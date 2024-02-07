import React from "react";
import PropTypes from "prop-types";

import {Chart, ChartCanvas, ZoomButtons} from "react-stockcharts";
import {CandlestickSeries,} from "react-stockcharts/lib/series";
import {XAxis, YAxis} from "react-stockcharts/lib/axes";
import {CrossHairCursor, EdgeIndicator, MouseCoordinateY,} from "react-stockcharts/lib/coordinates";
import {OHLCTooltip} from "react-stockcharts/lib/tooltip";

import {fitWidth} from "react-stockcharts/lib/helper";
import {format} from "d3-format";
import {discontinuousTimeScaleProvider} from "react-stockcharts/lib/scale";

function getMaxUndefined(calculators) {
    return calculators.map(each => each.undefinedLength()).reduce((a, b) => Math.max(a, b));
}

const LENGTH_TO_SHOW = 150;

const mouseEdgeAppearance = {
    textFill: "#542605",
    stroke: "#05233B",
    strokeOpacity: 1,
    strokeWidth: 3,
    arrowWidth: 5,
    fill: "#BCDEFA",
};


class CandleStickChart extends React.Component {
    /* constructor(props) {
         super(props);
         const { data: inputData } = props;

         const ema26 = ema()
             .id(0)
             .options({ windowSize: 26 })
             .merge((d, c) => {d.ema26 = c;})
             .accessor(d => d.ema26);

         const ema12 = ema()
             .id(1)
             .options({ windowSize: 12 })
             .merge((d, c) => {d.ema12 = c;})
             .accessor(d => d.ema12);

         const macdCalculator = macd()
             .options({
                 fast: 12,
                 slow: 26,
                 signal: 9,
             })
             .merge((d, c) => {d.macd = c;})
             .accessor(d => d.macd);

         const smaVolume50 = sma()
             .id(3)
             .options({
                 windowSize: 50,
                 sourcePath: "volume",
             })
             .merge((d, c) => {d.smaVolume50 = c;})
             .accessor(d => d.smaVolume50);

         const maxWindowSize = getMaxUndefined([
             smaVolume50
         ]);
         /!* SERVER - START *!/
         const dataToCalculate = inputData.slice(-LENGTH_TO_SHOW - maxWindowSize);

         const calculatedData = ema26(ema12(macdCalculator(smaVolume50(dataToCalculate))));
         const indexCalculator = discontinuousTimeScaleProviderBuilder().indexCalculator();

         // console.log(inputData.length, dataToCalculate.length, maxWindowSize)
         const { index } = indexCalculator(calculatedData);
         /!* SERVER - END *!/

         const xScaleProvider = discontinuousTimeScaleProviderBuilder()
             .withIndex(index);
         const { data: linearData, xScale, xAccessor, displayXAccessor } = xScaleProvider(calculatedData.slice(-LENGTH_TO_SHOW));

         // console.log(head(linearData), last(linearData))
         // console.log(linearData.length)

         this.state = {
             smaVolume50,
             linearData,
             data: linearData,
             xScale,
             xAccessor, displayXAccessor
         };
         this.handleDownloadMore = this.handleDownloadMore.bind(this);
     }*/

    /*handleDownloadMore(start, end) {
        if (Math.ceil(start) === end) return;
        // console.log("rows to download", rowsToDownload, start, end)
        const { data: prevData, ema26, ema12, macdCalculator, smaVolume50 } = this.state;
        const { data: inputData } = this.props;


        if (inputData.length === prevData.length) return;

        const rowsToDownload = end - Math.ceil(start);

        const maxWindowSize = getMaxUndefined([ema26,
            ema12,
            macdCalculator,
            smaVolume50
        ]);

        /!* SERVER - START *!/
        const dataToCalculate = inputData
            .slice(-rowsToDownload - maxWindowSize - prevData.length, - prevData.length);

        const calculatedData = ema26(ema12(macdCalculator(smaVolume50(dataToCalculate))));
        const indexCalculator = discontinuousTimeScaleProviderBuilder()
            .initialIndex(Math.ceil(start))
            .indexCalculator();
        const { index } = indexCalculator(
            calculatedData
                .slice(-rowsToDownload)
                .concat(prevData));
        /!* SERVER - END *!/

        const xScaleProvider = discontinuousTimeScaleProviderBuilder()
            .initialIndex(Math.ceil(start))
            .withIndex(index);

        const { data: linearData, xScale, xAccessor, displayXAccessor } = xScaleProvider(calculatedData.slice(-rowsToDownload).concat(prevData));

        // console.log(linearData.length)
        setTimeout(() => {
            // simulate a lag for ajax
            this.setState({
                data: linearData,
                xScale,
                xAccessor,
                displayXAccessor,
            });
        }, 300);
    }*/

    handleReset() {
        this.setState({
            suffix: this.state.suffix + 1
        });
    }

    render() {
        const {type, width, height, data: initialData, ratio} = this.props;
        // const { smaVolume50 } = this.state;

        const xScaleProvider = discontinuousTimeScaleProvider
            .inputDateAccessor(d => d.date);

        /*const xAccessor = d => d.date;*/
        /* const xExtents = [
             xAccessor(last(data)),
             xAccessor(data[0])
             // xAccessor(data[data.length - 3])
             /!*   new Date("2024-01-01T20:30:00.000Z"),
                new Date("2024-01-04T20:30:00.000Z")*!/
         ];*/

        const {
            data,
            xScale,
            xAccessor,
            displayXAccessor,
        } = xScaleProvider(initialData);

        const start = xAccessor(data[data.length - 1]);
        const end = xAccessor(data[Math.max(0, data.length - LENGTH_TO_SHOW)]);
        const xExtents = [start, end];

        return (
            <ChartCanvas height={height}
                         ratio={ratio}
                         width={width}
                         margin={{left: 50, right: 50, top: 10, bottom: 30}}
                         type={type}
                         seriesName="MSFT"
                         data={data}
                         xAccessor={xAccessor}
                         xScale={xScale}
                         xExtents={xExtents}
                         displayXAccessor={displayXAccessor}
                         // yScale={scaleTime()}
                         mouseMoveEvent={true}
                         panEvent={true}
                         zoomEvent={true}
                         clamp={false}>

                <Chart id={1} yExtents={d => [d.high, d.low]} className="dark"
                       padding={{top: 10, bottom: 20}}>
                    <XAxis axisAt="bottom" orient="bottom" showTicks={true} outerTickSize={0} ticks={6}
                           tickStroke="#FFFFFF"/>
                    <YAxis axisAt="right" orient="right" ticks={5} tickStroke="#FFFFFF"/>

                    <MouseCoordinateY
                        at="right"
                        orient="right"
                        displayFormat={format(".2f")}
                        {...mouseEdgeAppearance}/>

                    <CandlestickSeries
                        /* width={timeIntervalBarWidth(utcDay)}*/
                        fill={d => d.close > d.open ? "#547863" : "#a30f0f"}
                        stroke={d => d.close > d.open ? "#6BA583" : "#DB0000"}
                        wickStroke={d => d.close > d.open ? "#6BA583" : "#DB0000"}
                    />

                    <EdgeIndicator itemType="last" orient="right" edgeAt="right"
                                   yAccessor={d => d.close}
                                   fill={d => d.close > d.open ? "#A2F5BF" : "#F9ACAA"}
                                   stroke={d => d.close > d.open ? "#0B4228" : "#6A1B19"}
                                   textFill={d => d.close > d.open ? "#0B4228" : "#420806"}
                                   strokeOpacity={1}
                                   strokeWidth={3}
                                   arrowWidth={2}
                    />


                    <OHLCTooltip forChart={1} origin={[-40, 0]}/>
                    <ZoomButtons
                        onReset={this.handleReset}
                    />
                </Chart>

                {/*  <Chart id={2} height={150}
						yExtents={[d => d.volume, smaVolume50.accessor()]}
						origin={(w, h) => [0, h - 300]}>
					<YAxis axisAt="left" orient="left" ticks={5} tickFormat={format(".2s")}/>

					<MouseCoordinateY
						at="left"
						orient="left"
						displayFormat={format(".4s")} />

					<BarSeries yAccessor={d => d.volume} fill={d => d.close > d.open ? "#6BA583" : "#FF0000"} />
					<AreaSeries yAccessor={smaVolume50.accessor()} stroke={smaVolume50.stroke()} fill={smaVolume50.fill()}/>
				</Chart>
*/}

                <CrossHairCursor/>
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
