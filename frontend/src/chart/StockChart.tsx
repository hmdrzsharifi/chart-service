import {format} from "d3-format";
import {timeFormat} from "d3-time-format";
import * as React from "react";
import {
    BarSeries,
    LineSeries,
    MACDSeries,
    ElderRaySeries,
    AreaSeries,

    Chart,
    ChartCanvas,

    CrossHairCursor,
    CurrentCoordinate,
    EdgeIndicator,
    MouseCoordinateX,
    MouseCoordinateY,

    discontinuousTimeScaleProviderBuilder,
    elderRay,
    lastVisibleItemBasedZoomAnchor,

    MACDTooltip,
    MovingAverageTooltip,
    OHLCTooltip,
    RSITooltip,
    SingleValueTooltip,
    HoverTooltip,
    XAxis,
    YAxis,
    ZoomButtons,
    CircleMarker

} from "react-financial-charts";
import {IOHLCData} from "../data";
import {useEffect, useRef, useState} from "react";
import { isHover, saveNodeType } from "react-financial-charts";

import {
    atr14,
    bb,
    defaultSar,
    ema12,
    ema20,
    ema26,
    ema50,
    fi,
    fullSTO,
    macdCalculator,
    rsiCalculator,
    sma20,
    smaVolume50,
    tma20,
    wma20,
} from "../indicator/indicators";

import {TrendLine, FibonacciRetracement, EquidistantChannel, Brush , InteractiveText} from "react-financial-charts";
import {saveInteractiveNodes, getInteractiveNodes} from "../interaction/interactiveutils";
import useStore from "../util/store";
import {changeIndicatorsColor, fetchCandleData, useEventListener} from "../util/utils";
import {TrendLineType} from "../type/TrendLineType";
import {NO_OF_CANDLES} from "../config/constants";
import {HourAndMinutesTimeFrames} from "../type/Enum";
import SelectedSeries from "./SelectedSeries";
import useDesignStore from "../util/designStore";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {Button, IconButton} from "@mui/material";
import {Close} from "@mui/icons-material";
import {useTheme} from "@mui/material/styles";
import getDesignTokens from "../config/theme";

import {
    macdAppearance,
    atrAppearance,
    axisAppearance,
    mouseEdgeAppearance,
    theme,
    edgeIndicatorAppearance,
    volumeAppearance
} from '../indicator/indicatorSettings'

interface StockChartProps {
    readonly data: IOHLCData[];
    readonly setData: any;
    readonly height: number;
    readonly dateTimeFormat?: string;
    readonly width: number;
    readonly ratio: number;
    readonly theme?: any;
}

export const StockChart = (props: StockChartProps) => {
    const margin = {left: 0, right: 48, top: 0, bottom: 24};
    const pricesDisplayFormat = format(".2f");
    const xScaleProvider = discontinuousTimeScaleProviderBuilder().inputDateAccessor(
        (d: IOHLCData) => d.date,
    );

    const [fixedPosition, setFixedPosition] = useState(false)
    const [xExtents, setXExtents] = useState([0, 0])
    const [yExtents1, setYExtents1] = useState<any>()
    const muiTheme = useTheme();

    const {loadingMoreData, setLoadingMoreData} = useStore();
    const {timeFrame, setTimeFrame} = useStore();
    const {seriesType} = useStore();
    const {symbol, setSymbol} = useStore();
    const {themeMode} = useDesignStore();
    const {enableTrendLine, setEnableTrendLine} = useDesignStore();
    const {enableFib, setEnableFib} = useDesignStore();
    const {enableEquidistant, setEnableEquidistant} = useDesignStore();
    const {enableBrush, setEnableBrush} = useDesignStore();
    const {enableInteractiveObject, setEnableInteractiveObject} = useDesignStore();
    const [retracements, setRetracements] = useState<any[]>([]);
    const [textList_1, textList_3] = useState<any[]>([]);
    const [hover, setHover] = useState<boolean>();
    const [selected, setSelected] = useState<boolean>(false);
    const BRUSH_TYPE = "2D";
    /*const [trends, setTrends] = useState([{
        start: [37, 193.5119667590028],
        end: [107, 180.54797783933518],
        appearance: {stroke: "green"},
        type: "XLINE",
        selected: undefined
    }])*/
    const [trends, setTrends] = useState<TrendLineType[]>([])
    const [equidistantChannels, setEquidistantChannels] = useState<any[]>([])
    const [brushes, setBrushes] = useState<any[]>([])

    const dateFormat = timeFormat("%Y-%m-%d");
    const numberFormat = format(".2f");

    // const [trends, setTrends] = useState<any[]>([]);

    function handleReset() {
        setFixedPosition(false);
    }

    function handleHover(_: React.MouseEvent, moreProps: any) {
        if (hover !== moreProps.hovering) {
            setHover(moreProps.hovering);
        }
    }

    const hoverHandler = {
        onHover: handleHover,
        onUnHover: handleHover,
    };

    const handleDragStart = (_: React.MouseEvent, moreProps: any) => {
        // const { position } = this.props;
        const { mouseXY } = moreProps;
        const {
            chartConfig: { yScale },
            xScale,
        } = moreProps;
        const [mouseX, mouseY] = mouseXY;

        // const [textCX, textCY] = position;
        // const dx = mouseX - xScale(textCX);
        // const dy = mouseY - yScale(textCY);

        // this.dragStartPosition = {
        //     position,
        //     dx,
        //     dy,
        // };
    };

    // const onDrag?: (e: React.MouseEvent, index: number | undefined, xyValue: number[]) => void;
    // const handleDrag = (e: React.MouseEvent, moreProps: any) => {
    //     const { index, onDrag } = this.props;
    //     if (onDrag === undefined) {
    //         return;
    //     }

    // onDragComplete?: (e: React.MouseEvent, moreProps: any) => void;

    const canvasRef = useRef(null);

    const {data: initialData, dateTimeFormat = "%d %b", height, ratio, width, theme, setData} = props;

    function getMaxUndefined(calculators: any) {
        return calculators.map((each: any) => each.undefinedLength()).reduce((a: any, b: any) => Math.max(a, b));
    }
    const interactiveTextOnDrawComplete = (textList:any, moreProps:any) => {
        // this gets called on
        // 1. draw complete of drawing object
        // 2. drag complete of drawing object
        console.log({textList})
        const { id: chartId } = moreProps.chartConfig;
        setEnableInteractiveObject(false)
        // [`textList_${chartId}`]: textList

        // this.setState({
        //     enableInteractiveObject: false
        // });
    }

    /* const ema12 = ema()
         .id(1)
         .options({windowSize: 12})
         .merge((d: any, c: any) => {
             d.ema12 = c;
         })
         .accessor((d: any) => d.ema12);

     const ema26 = ema()
         .id(2)
         .options({windowSize: 26})
         .merge((d: any, c: any) => {
             d.ema26 = c;
         })
         .accessor((d: any) => d.ema26);
 */

    const handleDataLoadAfter = async (start: any, end: any) => {
        setFixedPosition(true);
        console.log("My Data After")
        /*if (this.state.loadingMoreData) {
            // Exit early if we are already loading data
            return;
        }

        this.setState({ loadingMoreData: true });

        try {
            // Find the earliest date in the current dataset
            const earliestDate = this.state.data[0].date;

            // Calculate the new start date to fetch from (7 days before the earliest date)
            const startDate = new Date(earliestDate);
            startDate.setDate(startDate.getDate() - 7);

            // Format dates to 'YYYY-MM-DD HH:MM:SS' format
            const fromDateString = startDate.toISOString().slice(0, 19).replace('T', ' ');
            const toDateString = earliestDate.toISOString().slice(0, 19).replace('T', ' ');

            // Fetch more data
            const moreData = await fetchCandleData(this.state.symbol,this.state.timeFrame,fromDateString, toDateString);

            // Combine new data with existing data
            const combinedData = moreData.concat(this.state.data);

            // Update the state with the combined data
            const { ema26, ema12, macdCalculator, smaVolume50 } = this.state;

            // Recalculate the scale with the new combined data
            const calculatedData = ema26(ema12(macdCalculator(smaVolume50(combinedData))));
            const indexCalculator = discontinuousTimeScaleProviderBuilder().indexCalculator();

            // Recalculate the index with the newly combined data
            const { index } = indexCalculator(calculatedData);
            const xScaleProvider = discontinuousTimeScaleProviderBuilder().withIndex(index);
            const { data: linearData, xScale, xAccessor, displayXAccessor } = xScaleProvider(calculatedData);

            // Update the state with the new data and the recalculated scale
            this.setState({
                data: linearData, // This is the combined data with the recalculated indices
                xScale,
                xAccessor,
                displayXAccessor,
                loadingMoreData: false,
            }, () => {
                // After the state has been updated, adjust the xScale domain to create a buffer
                const { xScale, xAccessor, data } = this.state;
                this.props.onUpdateData(this.state.data);
                const totalPoints = data.length;
                const bufferPoints = 5; // Number of points to leave as a buffer to the right
                const startPoint = xAccessor(data[Math.max(0, totalPoints - bufferPoints)]);
                const endPoint = xAccessor(data[totalPoints - 1]);

                // Set the visible scale domain to show data up to the buffer
                xScale.domain([startPoint, endPoint]);

                // Force update to re-render the chart with the new domain
                this.forceUpdate();
            });
        } catch (error) {
            console.error('Error fetching more candle data:', error);
            this.setState({ loadingMoreData: false });
        }*/
    };

    const handleDataLoadBefore = async (start: any, end: any) => {
        // setXExtents([e, e + LENGTH_TO_SHOW])
        // setFixedPosition(true);
        console.log("My Data Before")
        console.log({start})
        console.log({end})

        if (Math.ceil(start) === end) return;

        const rowsToDownload = end - Math.ceil(start);

        const maxWindowSize = getMaxUndefined([ema26,
            ema12,
            macdCalculator,
            smaVolume50

        ]);

        /* SERVER - START */
        const dataToCalculate = data
            .slice(-rowsToDownload - maxWindowSize - data.length, -data.length);

        console.log({dataToCalculate})
        const calculatedData = ema26(ema12(macdCalculator(smaVolume50(dataToCalculate))));
        const indexCalculator = discontinuousTimeScaleProviderBuilder()
            .initialIndex(Math.ceil(start))
            .indexCalculator();
        const {index} = indexCalculator(
            calculatedData
                .slice(-rowsToDownload)
                .concat(data));
        /* SERVER - END */

        const xScaleProvider = discontinuousTimeScaleProviderBuilder()
            .initialIndex(Math.ceil(start))
            .withIndex(index);

        const {data: linearData, xScale, xAccessor, displayXAccessor} = xScaleProvider(calculatedData.slice(-rowsToDownload).concat(data));


        console.log({rowsToDownload})
        // console.log({loadingMoreData})
        //
        // if (loadingMoreData) {
        //     // Exit early if we are already loading data
        //     return;
        // }
        //
        // setLoadingMoreData(true);

        try {
            // Find the earliest date in the current dataset
            const earliestDate = new Date(data[0].date);

            console.log("TIME ***************", earliestDate.getTime())

            // Calculate the new start date to fetch from (7 days before the earliest date)
            const endDate = new Date(earliestDate);
            // const startDate = endDate.getDate() - 150;

            // Format dates to 'YYYY-MM-DD HH:MM:SS' format
            // const fromDateString = startDate.toISOString().slice(0, 19).replace('T', ' ');
            // const toDateString = earliestDate.toISOString().slice(0, 19).replace('T', ' ');

            // Fetch more data
            const moreData = await fetchCandleData(symbol, 'D', Math.floor(endDate.getTime() / 1000) - (rowsToDownload * 24 * 3600), Math.floor(endDate.getTime() / 1000));

            console.log({moreData})
            // Combine new data with existing data
            const combinedData = moreData.concat(data);

            console.log({combinedData})

            setData(combinedData)
            // setLoadingMoreData(false);

            // Update the state with the combined data
            // const { ema26, ema12, macdCalculator, smaVolume50 } = this.state;

            // Recalculate the scale with the new combined data
            // const calculatedData = ema26(ema12(macdCalculator(smaVolume50(combinedData))));
            // const indexCalculator = discontinuousTimeScaleProviderBuilder().indexCalculator();

            // Recalculate the index with the newly combined data
            // const {index} = indexCalculator(calculatedData);
            // const xScaleProvider = discontinuousTimeScaleProviderBuilder().withIndex(index);
            // const {data: linearData, xScale, xAccessor, displayXAccessor} = xScaleProvider(calculatedData);

            // Update the state with the new data and the recalculated scale
            /*this.setState({
                data: linearData, // This is the combined data with the recalculated indices
                xScale,
                xAccessor,
                displayXAccessor,
                loadingMoreData: false,
            }, () => {
                // After the state has been updated, adjust the xScale domain to create a buffer
                const {xScale, xAccessor, data} = this.state;
                this.props.onUpdateData(this.state.data);
                const totalPoints = data.length;
                const bufferPoints = 5; // Number of points to leave as a buffer to the right
                const startPoint = xAccessor(data[Math.max(0, totalPoints - bufferPoints)]);
                const endPoint = xAccessor(data[totalPoints - 1]);

                // Set the visible scale domain to show data up to the buffer
                xScale.domain([startPoint, endPoint]);

                // Force update to re-render the chart with the new domain
                this.forceUpdate();
            });*/
        } catch (error) {
            console.error('Error fetching more candle data:', error);
            // setLoadingMoreData(false)
        }
    };

    const onDrawCompleteChart = (event: any, trends: any) => {
        // this gets called on
        // 1. draw complete of trendline
        // @ts-ignore
        console.log({trends});
        setEnableTrendLine(false);
        setTrends(trends)
    }

    const onFibComplete = (event: any, retracements: any) => {
        console.log({retracements});
        setEnableFib(false)
        setRetracements(retracements)
    }

    const onDrawCompleteEquidistantChannel = (event: any, equidistantChannels: any) => {
        // this gets called on
        // 1. draw complete of trendline
        // @ts-ignore
        console.log({equidistantChannels});
        setEnableEquidistant(false);
        setEquidistantChannels(equidistantChannels)
    }



    const handleSelection = (interactives: any) => {
        /* const state = toObject(interactives, each => {
             return [
                 `retracements_${each.chartId}`,
                 each.objects,
             ];
         });
         this.setState(state);*/

        console.log({interactives})
        // console.log({test})
    }

    const handler = ({key}: any) => {
        if (key === 'Delete') {
            const newTrends = trends.filter(each => !each.selected)

            setTrends(newTrends)

            const newRetracements = retracements.filter(each => !each.selected)

            setRetracements(newRetracements)

            const newEquidistantChannel = equidistantChannels.filter(each => !each.selected)

            setEquidistantChannels(newEquidistantChannel)
        } else if (key === 'Escape') {
            // @ts-ignore
            canvasRef?.current?.cancelDrag()
            setEnableTrendLine(false)
            setEnableFib(false)
            setEnableEquidistant(false)
        }
    };

    useEventListener("keydown", handler);

    /*useEffect(() => {
        document.addEventListener("keyup", onKeyPress);
    }, []);

    const onKeyPress = (e: any) => {
        const keyCode = e.which;
        console.log(keyCode);

        switch (keyCode) {
            case 46: { // DEL
                console.log({trends});
                const trends_1 = trends
                    .filter(each => !each.selected);
                console.log({trends_1});
                // const trends_3 = this.state.trends_3
                //     .filter(each => !each.selected);

                // this.canvasNode.cancelDrag();
                console.log({canvasRef})
                // canvasRef.current.cancelDrag();
                setTrends(trends_1)
                // setTrends(trend => trend.slice(0, trend.length-1))


                const retracements_1 = retracements
                    .filter(each => !each.selected);
                // this.canvasNode.cancelDrag();
                setRetracements(retracements_1)


                break;
            }
            // case 27: { // ESC
            //     this.node_1.terminate();
            //     this.node_3.terminate();
            //     this.canvasNode.cancelDrag();
            //     this.setState({
            //         enableTrendLine: false
            //     });
            //     break;
            // }
            // case 68:   // D - Draw trendline
            // case 69: { // E - Enable trendline
            //     this.setState({
            //         enableTrendLine: true
            //     });
            //     break;
            // }
        }
    }*/

    const elder = elderRay();
    // const calculatedData = elder(ema26(ema12(initialData)));
    // const calculatedData = macdCalculator(ema12(ema26(initialData)));
    // const calculatedData = smaVolume50(macdCalculator(ema12(ema26(initialData))));

    let calculatedData = calculateData(initialData)

    /* if (calculatedData.length <= 1) {
         return null
     }*/

    function calculateData(inputData: any) {
        /*return ema20(
            wma20(
                tma20(
                    sma20(
                        ema50(
                            bb(
                                smaVolume50(macdCalculator(ema12(ema26(elder(rsiCalculator(fullSTO(fi(defaultSar(atr14(inputData))))))))))
                            )
                        )
                    )
                )
            )
        )*/

        return macdCalculator(ema12(ema26(initialData)))
    }

    const {data, xScale, xAccessor, displayXAccessor} = xScaleProvider(calculatedData);

    useEffect(() => {
        if (!fixedPosition) {
            const max = xAccessor(data[data.length - 1]);
            const min = xAccessor(data[Math.max(0, data.length - NO_OF_CANDLES)]);
            setXExtents([min, max + 10])
        }
    }, [props, fixedPosition])

    useEffect(() => {

        // change Indicators according to themeMode
        changeIndicatorsColor(themeMode, trends, setTrends, retracements, setRetracements)

    }, [themeMode])

    const gridHeight = height - margin.top - margin.bottom;

    const elderRayHeight = NO_OF_CANDLES;
    const elderRayOrigin = (_: number, h: number) => [0, h - elderRayHeight];
    const barChartHeight = gridHeight / 4;
    const barChartOrigin = (_: number, h: number) => [0, h - barChartHeight - elderRayHeight];
    const chartHeight = gridHeight - elderRayHeight;
    const {disableMovingAverage, setDisableMovingAverage} = useStore();
    const {disableElderRay, setDisableElderRay} = useStore();
    const {disableMACD, setDisableMACD} = useStore();
    const {disableHoverTooltip, setDisableHoverTooltip} = useStore();

    const timeDisplayFormat = timeFormat(HourAndMinutesTimeFrames.includes(timeFrame) ? "%H %M" : dateTimeFormat);
    const [openMovingAverageModal, setOpenMovingAverageModal] = useState<boolean>(false);
    const [openElderRayModal, setOpenElderRayModal] = useState<boolean>(false);


    const xAndYColors = {
        tickLabelFill: getDesignTokens(themeMode).palette.lineColor,
        tickStrokeStyle: getDesignTokens(themeMode).palette.lineColor,
        strokeStyle: getDesignTokens(themeMode).palette.lineColor,
        gridLinesStrokeStyle: getDesignTokens(themeMode).palette.grindLineColor,
    }

    const handleBrush1 = (brushCoords:any, moreProps:any) => {
        const { start, end } = brushCoords;
        const left = Math.min(start.xValue, end.xValue);
        const right = Math.max(start.xValue, end.xValue);

        const low = Math.min(start.yValue, end.yValue);
        const high = Math.max(start.yValue, end.yValue);

        // uncomment the line below to make the brush to zoom
        setXExtents([left, right])
        setYExtents1(BRUSH_TYPE === "2D" ? [low, high] : yExtents1)
        setEnableBrush(false)
        console.log(enableBrush)
        // this.setState({
        //     xExtents: [left, right],
        //     yExtents1: BRUSH_TYPE === "2D" ? [low, high] : this.state.yExtents1,
        //     brushEnabled: false,
        // });
    }


    // @ts-ignore
    return (
        <ChartCanvas
            ref={canvasRef}
            height={height}
            ratio={ratio}
            width={width}
            margin={margin}
            data={data}
            displayXAccessor={displayXAccessor}
            seriesName="Data"
            xScale={xScale}
            xAccessor={xAccessor}
            xExtents={xExtents}
            zoomAnchor={lastVisibleItemBasedZoomAnchor}
            onLoadAfter={handleDataLoadAfter}
            onLoadBefore={handleDataLoadBefore}
        >
            /*##### Main Chart #####*/
            <Chart
                id={1}
                height={chartHeight}
                yExtents={candleChartExtents}
            >
                <XAxis showGridLines showTicks={false} showTickLabel={false} {...xAndYColors} />
                <YAxis showGridLines tickFormat={pricesDisplayFormat} {...xAndYColors} />

                <SelectedSeries series={seriesType} data={data}/>

                {!disableMovingAverage && (
                    <div>
                        <LineSeries yAccessor={ema26.accessor()} strokeStyle={ema26.stroke()}/>
                        <CurrentCoordinate yAccessor={ema26.accessor()} fillStyle={ema26.stroke()}/>
                        <LineSeries yAccessor={ema12.accessor()} strokeStyle={ema12.stroke()}/>
                        <CurrentCoordinate yAccessor={ema12.accessor()} fillStyle={ema12.stroke()}/>
                    </div>
                )}

                <MouseCoordinateY rectWidth={margin.right} displayFormat={pricesDisplayFormat} arrowWidth={10}/>
                <EdgeIndicator
                    itemType="last"
                    arrowWidth={10}
                    rectWidth={margin.right}
                    fill={openCloseColor}
                    lineStroke={openCloseColor}
                    displayFormat={pricesDisplayFormat}
                    yAccessor={yEdgeIndicator}
                />
                {/* <EdgeIndicator itemType="last" orient="right" edgeAt="right"
                                   yAccessor={d => d.close}
                                   fill={d => d.close > d.open ? "#A2F5BF" : "#F9ACAA"}
                                   stroke={d => d.close > d.open ? "#0B4228" : "#6A1B19"}
                                   textFill={d => d.close > d.open ? "#0B4228" : "#420806"}
                                   strokeOpacity={1}
                                   strokeWidth={3}
                                   arrowWidth={2}
                    />*/}

                {!disableMovingAverage && (
                    <MovingAverageTooltip
                        textFill={getDesignTokens(themeMode).palette.text.primary}
                        onClick={() => setOpenMovingAverageModal(true)}
                        origin={[8, 24]}
                        options={[
                            {
                                yAccessor: ema26.accessor(),
                                type: "EMA",
                                stroke: ema26.stroke(),
                                windowSize: ema26.options().windowSize,
                            },
                            {
                                yAccessor: ema12.accessor(),
                                type: "EMA",
                                stroke: ema12.stroke(),
                                windowSize: ema12.options().windowSize,
                            },
                        ]}
                    />
                )}

                <Modal
                    open={openMovingAverageModal}
                    onClose={() => setOpenMovingAverageModal(false)}
                    sx={{maxHeight: '95%'}}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4
                    }}>
                        <Typography id="modal-modal-title" variant="h6" component="h2">
                            changing
                        </Typography>
                        <Button color='error' title='disable MovingAverage' onClick={() => {
                            setDisableMovingAverage(true)
                            setOpenMovingAverageModal(false)
                        }}> disable MovingAverage </Button>
                    </Box>
                </Modal>

                <ZoomButtons onReset={handleReset}/>
                <OHLCTooltip origin={[8, 16]} textFill={getDesignTokens(themeMode).palette.text.primary}/>

                /*##### Interactive #####*/
                <TrendLine
                    // ref={saveInteractiveNodes("Trendline", 1)}
                    enabled={enableTrendLine}
                    type="RAY"
                    snap={false}
                    snapTo={d => [d.high, d.low]}
                    onStart={() => console.log("START", trends)}
                    onComplete={onDrawCompleteChart}
                    appearance={{
                        strokeStyle: getDesignTokens(themeMode).palette.lineColor,
                        strokeWidth: 1,
                        strokeDasharray: "Solid",
                        edgeStrokeWidth: 1,
                        edgeFill: getDesignTokens(themeMode).palette.lineColor,
                        edgeStroke: getDesignTokens(themeMode).palette.edgeStroke,
                    }}
                    // onComplete={() => console.log("End", trends)}
                    trends={trends}
                />

                <FibonacciRetracement
                    // ref={saveInteractiveNodes("FibonacciRetracement", 1)}
                    enabled={enableFib}
                    retracements={retracements}
                    onComplete={onFibComplete}
                    appearance={{
                        strokeStyle: getDesignTokens(themeMode).palette.lineColor,
                        strokeWidth: 1,
                        fontFamily: "-apple-system, system-ui, Roboto, 'Helvetica Neue', Ubuntu, sans-serif",
                        fontSize: 11,
                        fontFill: getDesignTokens(themeMode).palette.text.primary,
                        edgeStroke: getDesignTokens(themeMode).palette.edgeStroke,
                        edgeFill: getDesignTokens(themeMode).palette.lineColor,
                        nsEdgeFill: getDesignTokens(themeMode).palette.edgeStroke,
                        edgeStrokeWidth: 1,
                        r: 5,
                    }}
                />

                <EquidistantChannel
                    // ref={this.saveInteractiveNodes("EquidistantChannel", 1)}
                    onSelect={onDrawCompleteEquidistantChannel}
                    enabled={enableEquidistant}
                    onStart={() => console.log("START")}
                    onComplete={onDrawCompleteEquidistantChannel}
                    channels={equidistantChannels}
                    appearance={{
                        stroke: "#000000",
                        strokeOpacity: 1,
                        strokeWidth: 1,
                        fill: "rgba(112, 176, 217, 0.4)",
                        fillOpacity:0.1,
                        edgeStroke: "#000000",
                        edgeFill: "#FFFFFF",
                        edgeFill2: "#070707",
                        edgeStrokeWidth: 1,
                        r: 5,
                    }}
                />

                <Brush
                    // ref={this.saveInteractiveNode(1)}
                    interactiveState={handleBrush1}
                    enabled={enableBrush}
                    fillStyle="rgba(112, 176, 217, 0.4)"
                    type={BRUSH_TYPE}
                    onBrush={handleBrush1}/>

                {/*<InteractiveText*/}
                {/*    onChoosePosition={(e: React.MouseEvent, newText: any, moreProps: any) =>{*/}

                {/*    } }*/}
                {/*    ref={saveNodeType("text")}*/}
                {/*    // selected={selected || hover}*/}
                {/*    // interactiveCursorClass="react-financial-charts-move-cursor"*/}
                {/*    {...hoverHandler}*/}
                {/*    enabled={enableInteractiveObject}*/}
                {/*    onDragStart={handleDragStart}*/}
                {/*    onDrag={handleDrag}*/}
                {/*    onDragComplete={onDragComplete}*/}
                {/*    position={position}*/}
                {/*    bgFillStyle={getDesignTokens(themeMode).palette.lineColor}*/}
                {/*    bgStroke={getDesignTokens(themeMode).palette.edgeStroke}*/}
                {/*    bgStrokeWidth={1}*/}
                {/*    textFill={getDesignTokens(themeMode).palette.text.primary}*/}
                {/*    fontFamily={fontFamily}*/}
                {/*    fontStyle={fontStyle}*/}
                {/*    fontWeight={fontWeight}*/}
                {/*    fontSize={fontSize}*/}
                {/*    text={text}*/}
                {/*/>*/}

                {!disableHoverTooltip && (
                <HoverTooltip
                    yAccessor={ema12.accessor()}
                    tooltip={{
                        content: ({ currentItem, xAccessor }) => ({
                            x: dateFormat(xAccessor(currentItem)),
                            y: [
                                {
                                    label: "open",
                                    value: currentItem.open && numberFormat(currentItem.open),
                                },
                                {
                                    label: "high",
                                    value: currentItem.high && numberFormat(currentItem.high),
                                },
                                {
                                    label: "low",
                                    value: currentItem.low && numberFormat(currentItem.low),
                                },
                                {
                                    label: "close",
                                    value: currentItem.close && numberFormat(currentItem.close),
                                },
                            ],
                        }),
                    }}
                />
                    )}

            </Chart>

            /*##### Volume Chart #####*/
            {/*{volume.active && (*/}
            <Chart
                id={2}
                height={barChartHeight}
                origin={barChartOrigin}
                yExtents={barChartExtents}
                // yExtents={[d => d.volume, smaVolume50.accessor()]}
            >
                <XAxis {...xAndYColors} />
                <YAxis {...xAndYColors} />
                <BarSeries fillStyle={volumeColor} yAccessor={d => d.volume}/>
                {/*<AreaSeries yAccessor={smaVolume50.accessor()} {...volumeAppearance} />*/}
            </Chart>
            {/*)}*/}

            /*##### ElderRay Chart #####*/
            {!disableElderRay && (
                <Chart id={3} height={elderRayHeight} yExtents={[0, elder.accessor()]} origin={elderRayOrigin}
                       padding={{top: 8, bottom: 8}}>
                    {/*<XAxis showGridLines gridLinesStrokeStyle="#e0e3eb" {...xAndYColors}/>*/}
                    <XAxis showGridLines {...xAndYColors}/>
                    <YAxis ticks={4} tickFormat={pricesDisplayFormat} {...xAndYColors}/>

                    <MouseCoordinateX displayFormat={timeDisplayFormat}/>
                    <MouseCoordinateY rectWidth={margin.right} displayFormat={pricesDisplayFormat}/>
                    <MouseCoordinateY
                        at="right"
                        orient="right"
                        displayFormat={pricesDisplayFormat}
                        {...mouseEdgeAppearance}/>
                    <ElderRaySeries yAccessor={elder.accessor()}/>
                    <SingleValueTooltip
                        // origin={[10,50]}
                        className='elderChart'
                        xInitDisplay='200px'
                        onClick={() => setOpenElderRayModal(true)}
                        yAccessor={elder.accessor()}
                        yLabel="Elder Ray"
                        yDisplayFormat={(d: any) =>
                            `${pricesDisplayFormat(d.bullPower)}, ${pricesDisplayFormat(d.bearPower)}`
                        }
                        origin={[8, 16]}
                    />

                    <Modal
                        open={openElderRayModal}
                        onClose={() => setOpenElderRayModal(false)}
                        sx={{maxHeight: '95%'}}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 400,
                            bgcolor: 'background.paper',
                            boxShadow: 24,
                            p: 4
                        }}>
                            <Typography id="modal-modal-title" variant="h6" component="h2">
                                changing
                            </Typography>
                            <Button color='error' title='disable ElderRay' onClick={() => {
                                setDisableElderRay(true)
                                setOpenElderRayModal(false)
                            }}> disable ElderRay </Button>
                        </Box>
                    </Modal>
                </Chart>
            )}

            /*##### MACD Chart #####*/
            {!disableMACD && (
                <Chart id={4} height={150}
                       yExtents={macdCalculator.accessor()}
                       origin={(w, h) => [0, h - 150]} padding={{top: 10, bottom: 10}}
                >
                    <XAxis axisAt="bottom" orient="bottom"/>
                    <YAxis axisAt="right" orient="right" ticks={2}/>

                    <MouseCoordinateX
                        at="bottom"
                        orient="bottom"
                        displayFormat={timeFormat("%Y-%m-%d")}
                        rectRadius={5}
                        {...mouseEdgeAppearance}
                    />
                    <MouseCoordinateY
                        at="right"
                        orient="right"
                        displayFormat={pricesDisplayFormat}
                        {...mouseEdgeAppearance}
                    />

                    <MACDSeries yAccessor={d => d.macd} {...macdAppearance} />
                    <MACDTooltip
                        origin={[-38, 15]}
                        yAccessor={d => d.macd}
                        options={macdCalculator.options()}
                        appearance={macdAppearance}
                    />
                </Chart>
            )}

           {/* {rsi.active && (
                <Chart
                    id={4}
                    yExtents={[0, 100]}
                    height={rsi.height}
                    origin={(w, h) => [
                        0,
                        h - rsi.height - (atr.active ? atr.height : 0) - (forceIndex.active ? forceIndex.height : 0)
                    ]}
                    padding={{ top: 10, bottom: 10 }}
                >
                    <XAxis
                        axisAt="bottom"
                        orient="bottom"
                        showTicks={!atr.active && !forceIndex.active}
                        {...xGrid}
                        {...axisAppearance}
                        outerTickSize={0}
                    />

                    <YAxis axisAt="right" orient="right" tickValues={[30, 50, 70]} {...yGrid} {...axisAppearance} />

                    {!atr.active &&
                    !forceIndex.active && (
                        <MouseCoordinateX
                            at="bottom"
                            orient="bottom"
                            displayFormat={timeFormat('%Y-%m-%d')}
                            {...mouseEdgeAppearance}
                        />
                    )}
                    <MouseCoordinateY at="right" orient="right" displayFormat={format('.2f')} {...mouseEdgeAppearance} />

                    <RSISeries yAccessor={d => d.rsi} />

                    <RSITooltip origin={[-28, 15]} yAccessor={d => d.rsi} options={rsiCalculator.options()} />
                </Chart>
            )}*/}
{/*            {atr.active && (
                <Chart
                    id={5}
                    yExtents={atr14.accessor()}
                    height={atr.height}
                    origin={(w, h) => [0, h - atr.height - (forceIndex.active ? forceIndex.height : 0)]}
                    padding={{ top: 10, bottom: 10 }}
                >
                    <XAxis
                        axisAt="bottom"
                        orient="bottom"
                        {...xGrid}
                        {...axisAppearance}
                        outerTickSize={0}
                        showTicks={!forceIndex.active}
                    />
                    <YAxis axisAt="right" orient="right" {...yGrid} {...axisAppearance} ticks={2} />

                    {!forceIndex.active && (
                        <MouseCoordinateX
                            at="bottom"
                            orient="bottom"
                            displayFormat={timeFormat('%Y-%m-%d')}
                            {...mouseEdgeAppearance}
                        />
                    )}
                    <MouseCoordinateY at="right" orient="right" displayFormat={format('.2f')} {...mouseEdgeAppearance} />

                    <LineSeries yAccessor={atr14.accessor()} {...atrAppearance} />
                    <SingleValueTooltip
                        yAccessor={atr14.accessor()}
                        yLabel={`ATR (${atr14.options().windowSize})`}
                        yDisplayFormat={format('.2f')}
                        origin={[-40, 15]}
                    />
                </Chart>
            )}*/}

           {/* {forceIndex.active && (
                <Chart
                    id={6}
                    height={150}
                    yExtents={fi.accessor()}
                    origin={(w, h) => [0, h - 150]}
                    padding={{ top: 30, right: 0, bottom: 10, left: 0 }}
                >
                    <XAxis axisAt="bottom" orient="bottom" {...xGrid} {...axisAppearance} outerTickSize={0} />
                    <YAxis
                        axisAt="right"
                        orient="right"
                        {...yGrid}
                        ticks={4}
                        tickFormat={format('.2s')}
                        {...axisAppearance}
                    />
                    <MouseCoordinateX
                        at="bottom"
                        orient="bottom"
                        displayFormat={timeFormat('%Y-%m-%d')}
                        {...mouseEdgeAppearance}
                    />
                    <MouseCoordinateY at="right" orient="right" displayFormat={format('.4s')} {...mouseEdgeAppearance} />

                    <AreaSeries baseAt={scale => scale(0)} yAccessor={fi.accessor()} />
                    <StraightLine yValue={0} />

                    <SingleValueTooltip
                        yAccessor={fi.accessor()}
                        yLabel="ForceIndex (1)"
                        yDisplayFormat={format('.4s')}
                        origin={[-40, 15]}
                    />
                </Chart>
            )}
*/}

            <CrossHairCursor/>
            {/*
            <DrawingObjectSelector
                enabled={!enableTrendLine}
                getInteractiveNodes={() => []}
                drawingObjectMap={{
                    Trendline: "trends"
                }}
                onSelect={handleSelection}
            />

            <DrawingObjectSelector
                enabled={!enableFib}
                getInteractiveNodes={() => []}
                drawingObjectMap={{
                    FibonacciRetracement: "retracements"
                }}
                onSelect={handleSelection}
            />
            />*/}
        </ChartCanvas>
    );
}

const barChartExtents = (data: IOHLCData) => {
    return data.volume;
};

const candleChartExtents = (data: IOHLCData) => {
    return [data.high, data.low];
};

const yEdgeIndicator = (data: IOHLCData) => {
    return data.close;
};

const volumeColor = (data: IOHLCData) => {
    return data.close > data.open ? "#8cc17699" : "#b82c0c99";
};


const openCloseColor = (data: IOHLCData) => {
    return data.close > data.open ? "#8cc176" : "#b82c0c";
};

