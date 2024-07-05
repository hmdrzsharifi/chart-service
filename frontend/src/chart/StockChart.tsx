import {format} from "d3-format";
import {timeFormat} from "d3-time-format";
import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {
    AlternatingFillAreaSeries,
    AreaSeries,
    atr,
    BarSeries,
    BollingerBandTooltip,
    BollingerSeries,
    Brush,
    change,
    Chart,
    ChartCanvas,
    CrossHairCursor,
    CurrentCoordinate,
    discontinuousTimeScaleProviderBuilder,
    EdgeIndicator,
    elderRay,
    ElderRaySeries,
    ema,
    EquidistantChannel,
    FibonacciRetracement,
    forceIndex,
    HoverTooltip,
    InteractiveText,
    lastVisibleItemBasedZoomAnchor,
    LineSeries,
    MACDSeries,
    MACDTooltip,
    MouseCoordinateX,
    MouseCoordinateY,
    MovingAverageTooltip,
    OHLCSeries,
    OHLCTooltip,
    rsi,
    RSISeries,
    RSITooltip,
    sar,
    SARSeries,
    SingleValueTooltip,
    stochasticOscillator,
    StochasticSeries,
    StochasticTooltip,
    StraightLine,
    TrendLine,
    StandardDeviationChannel,
    GannFan,
    XAxis,
    YAxis,
    ZoomButtons,
} from "react-financial-charts";
import {IOHLCData} from "../data";

import {
    accelerationFactor,
    bb,
    ema12,
    ema20,
    ema26,
    ema50,
    macdCalculator,
    maxAccelerationFactor,
    sma20,
    smaVolume50,
} from "../indicator/indicators";
import useStore from "../util/store";
import {changeIndicatorsColor, fetchCandleDataFinnhub, studyChartHeight, useEventListener} from "../util/utils";
import {TrendLineType} from "../type/TrendLineType";
import {
    NO_OF_CANDLES,
    TOOLTIP_HEIGHT,
    TOOLTIP_PADDING_LEFT,
    TOOLTIP_PADDING_TOP
} from "../config/constants";
import HorizontalRuleRoundedIcon from '@mui/icons-material/HorizontalRuleRounded';
import {HourAndMinutesTimeFrames, StudiesChart, TimeFrame} from "../type/Enum";
import SelectedSeries from "./SelectedSeries";
import useDesignStore from "../util/designStore";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {
    Button,
    ClickAwayListener,
    ListItem,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    MenuList,
    Popover
} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import getDesignTokens from "../config/theme";

import {macdAppearance, mouseEdgeAppearance, stoAppearance} from '../indicator/indicatorSettings'
import {BorderColor} from "@mui/icons-material";
import EditIcon from '@mui/icons-material/Edit';
// @ts-ignore
import {ColorResult, SketchPicker} from "react-color";

interface StockChartProps {
    readonly data: IOHLCData[];
    readonly setData: any;
    readonly height: number;
    readonly dateTimeFormat?: string;
    readonly width: number;
    readonly ratio: number;
    readonly theme?: any;
}

const bbStroke = {
    top: "#964B00",
    middle: "#000000",
    bottom: "#964B00",
};

const bbFill = "rgba(70,130,180,0.24)";

export const StockChart = (props: StockChartProps) => {
    const margin = {left: 0, right: 58, top: 0, bottom: 24};
    const pricesDisplayFormat = format(".2f");
    const xScaleProvider = discontinuousTimeScaleProviderBuilder().inputDateAccessor(
        (d: IOHLCData) => d.date,
    );

    const {fixedPosition, setFixedPosition} = useStore()
    const [xExtents, setXExtents] = useState([0, 0])
    // const [xScale, setXScale] = useState()
    // const [xAccessor, setXAccessor] = useState()
    const [yExtents1, setYExtents1] = useState<any>()
    const muiTheme = useTheme();

    const {studiesCharts, setStudiesCharts} = useStore();
    const {studiesChartsWithTooltip, setStudiesChartsWithTooltip} = useStore();

    const {loadingMoreData, setLoadingMoreData} = useStore();
    const {timeFrame, setTimeFrame} = useStore();
    const {seriesType} = useStore();
    const {symbol, setSymbol} = useStore();
    const {disableCrossHair} = useStore();
    const {themeMode} = useDesignStore();
    const {selectedSymbol} = useStore();
    const {enableTrendLine, setEnableTrendLine} = useDesignStore();
    const {enableFib, setEnableFib} = useDesignStore();
    const {enableEquidistant, setEnableEquidistant} = useDesignStore();
    const {enableStandardDeviationChannel, setEnableStandardDeviationChannel} = useDesignStore();
    const {enableBrush, setEnableBrush} = useDesignStore();
    const {enableGanFan, setEnableGanFan} = useDesignStore();
    const {enableInteractiveObject, setEnableInteractiveObject} = useDesignStore();
    const [retracements, setRetracements] = useState<any[]>([]);
    const [text, setText] = useState<any[]>([]);
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
    const [standardDeviationChannel, setStandardDeviationChannel] = useState<any[]>([]);
    const [fans, setFans] = useState<any[]>([]);
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

    const onDrawComplete = (textList: any, moreProps: any) => {
        // this gets called on
        // 1. draw complete of drawing object
        // 2. drag complete of drawing object
        console.log({textList})
        const {id: chartId} = moreProps.chartConfig;

        setEnableInteractiveObject(false)
        setText([...text, textList])
    }

    const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
        console.log({event})
        event.preventDefault();
        setMenuPosition({
            mouseX: event.clientX,
            mouseY: event.clientY,
        });
        setContextMenuVisible(true);
    };

    const handleDragStart = (_: React.MouseEvent, moreProps: any) => {
        // const { position } = this.props;
        const {mouseXY} = moreProps;
        const {
            chartConfig: {yScale},
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

    const interactiveTextOnDrawComplete = (textList: any, moreProps: any) => {
        // this gets called on
        // 1. draw complete of drawing object
        // 2. drag complete of drawing object
        console.log({textList})
        const {id: chartId} = moreProps.chartConfig;
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

    const handleDataLoadBefore = async (start: number, end: number) => {
        console.log("My Data Before")
        if (Math.ceil(start) === end) return;

        const rowsToDownload = end - Math.ceil(start);
        console.log({rowsToDownload})
        if (rowsToDownload <= 1) return;

        // onLoadData?.(rowsToDownload, -Math.ceil(start));
        // setXExtents([e, e + LENGTH_TO_SHOW])
        // setFixedPosition(true);

        const maxWindowSize = getMaxUndefined([ema26,
            ema12,
            macdCalculator,
            smaVolume50
        ]);

        // if (loadingMoreData) {
        //     // Exit early if we are already loading data
        //     return;
        // }
        //
        // setLoadingMoreData(true);

        try {
            // Find the earliest date in the current dataset
            const endDate = new Date(data[0].date);

            console.log("earliestDate TIME ***************", endDate)

            // Calculate the new start date to fetch from (7 days before the earliest date)
            // const endDate = new Date(earliestDate);
            // console.log("earliestDate TIME ***************", endDate)
            // const startDate = endDate.getDate() - 150;

            // Format dates to 'YYYY-MM-DD HH:MM:SS' format
            // const fromDateString = startDate.toISOString().slice(0, 19).replace('T', ' ');
            // const toDateString = earliestDate.toISOString().slice(0, 19).replace('T', ' ');

            let from;
            switch (timeFrame) {
                case "1M":
                    from = Math.floor(endDate.getTime() / 1000) - (rowsToDownload * 60);
                    break;
                case "D":
                    from = Math.floor(endDate.getTime() / 1000) - (rowsToDownload * 24 * 3600);
                    break;

                //todo add other time frame

                default:
                    from = Math.floor(endDate.getTime() / 1000) - (rowsToDownload * 24 * 3600)
            }

            // const moreData = await fetchCandleData(symbol, timeFrame, from, Math.floor(new Date().getTime() / 1000));
            // Fetch more data
            const moreData = await fetchCandleDataFinnhub(symbol, timeFrame, from, Math.floor(endDate.getTime() / 1000));

            console.log({moreData})
            // Combine new data with existing data
            const combinedData = moreData.concat(data);
            console.log({combinedData})

            setData(combinedData)
            setFixedPosition(true)

            /* SERVER - START */
            /*   const dataToCalculate = data
                   .slice(-rowsToDownload - maxWindowSize - data.length, -data.length);*/

            // console.log({dataToCalculate})

            // Recalculate the scale with the new combined data
            const calculatedData = ema26(ema12(macdCalculator(smaVolume50(moreData))));
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

            const {
                data: linearData,
                xScale,
                xAccessor,
                displayXAccessor
            } = xScaleProvider(calculatedData.slice(-rowsToDownload).concat(data));
            const max = xAccessor(data[data.length - 1]);
            const min = xAccessor(data[0]);
            setXExtents([min, max])

            // Update the state with the combined data
            // const { ema26, ema12, macdCalculator, smaVolume50 } = this.state;
            // const indexCalculator = discontinuousTimeScaleProviderBuilder().indexCalculator();

            // Recalculate the index with the newly combined data
            // const { index } = indexCalculator(calculatedData);
            // const xScaleProvider = discontinuousTimeScaleProviderBuilder().withIndex(index);
            // const { data: linearData, xScale, xAccessor, displayXAccessor } = xScaleProvider(calculatedData);
            // setData(linearData)
            /*  const max = xAccessor(data[data.length - 1]);
              const min = xAccessor(data[Math.max(0, data.length - NO_OF_CANDLES)]);
              setXExtents([min, max])*/


            // setXScale(xScale)
            // setXAccessor(xAccessor)
            // setDisplayXAccessor(xAccessor)
            // Update the state with the new data and the recalculated scale

            // After the state has been updated, adjust the xScale domain to create a buffer
            // const { xScale, xAccessor, data } = this.state;
            // this.props.onUpdateData(this.state.data);
            const totalPoints = data.length;
            const bufferPoints = 5; // Number of points to leave as a buffer to the right
            const startPoint = xAccessor(data[Math.max(0, totalPoints - bufferPoints)]);
            const endPoint = xAccessor(data[totalPoints - 1]);

            // Set the visible scale domain to show data up to the buffer
            xScale.domain([startPoint, endPoint]);

            // Force update to re-render the chart with the new domain
            // this.forceUpdate();


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

    const [contextMenuVisible, setContextMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState<{ mouseX: null | number; mouseY: null | number }>({
        mouseX: null,
        mouseY: null,
    });

    const [colorPickerVisible, setColorPickerVisible] = useState(false);
    const [colorPickerAnchorEl, setColorPickerAnchorEl] = useState<HTMLDivElement | null>(null);

    const [selectedTrend, setSelectedTrend] = useState<any | null>(null);

    const onDrawCompleteChart = (e: React.MouseEvent, newTrends: any[], moreProps: any) => {
        console.log({newTrends});
        setEnableTrendLine(false);
        setTrends(newTrends);

        setMenuPosition({
            mouseX: e.clientX - 2,
            mouseY: e.clientY - 4,
        });
        setContextMenuVisible(true);
        setSelectedTrend(newTrends[newTrends.length - 1]);
    };

    const handleColorChange = (color: ColorResult) => {
        if (selectedTrend) {
            console.log({color})
            console.log({trends})
            console.log({selectedTrend})
            const updatedTrends = trends.map(trend =>
                trend.start === selectedTrend.start && trend.end === selectedTrend.end
                    ? {
                        ...trend,
                        appearance: {
                            ...trend.appearance,
                            // edgeFill: color.hex,
                            strokeStyle: color.hex
                        },
                    }
                    : trend
            );
            console.log({updatedTrends})
            setTrends(updatedTrends);
            setSelectedTrend({
                ...selectedTrend,
                appearance: {
                    ...selectedTrend.appearance,
                    edgeFill: color.hex,
                }
            });
        }
    };


    const handleClose = () => {
        setContextMenuVisible(false);
        setMenuPosition({mouseX: null, mouseY: null});
        setColorPickerVisible(false);
        setColorPickerAnchorEl(null);
    };

    const handleOpenColorPicker = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        setColorPickerAnchorEl(event.currentTarget);
        setColorPickerVisible(true);
    };

    const handleCloseColorPicker = () => {
        setColorPickerVisible(false);
        setColorPickerAnchorEl(null);
    };

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [movingAveragePopanchorEl, setMovingAveragePopanchorEl] = useState<null | SVGRectElement>(null);
    const [submenuAnchorEl, setSubmenuAnchorEl] = useState<null | HTMLElement>(null);
    const [typeAnchorEl, setTypeAnchorEl] = useState<null | HTMLElement>(null);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleSubmenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setSubmenuAnchorEl(event.currentTarget);
    };

    const handleTypeClick = (event: React.MouseEvent<HTMLElement>) => {
        setTypeAnchorEl(event.currentTarget);
    };

    const handleTypeClose = (value: string) => () => {
        console.log(`Selected Sub Option: ${value}`);
        if (selectedTrend) {
            const updatedTrends = trends.map(trend =>
                trend.start === selectedTrend.start && trend.end === selectedTrend.end
                    ? {
                        ...trend,
                        type: value,
                    }
                    : trend
            );
            setTrends(updatedTrends);
            setSelectedTrend({
                ...selectedTrend,
                type: value,
            });
        }
        setTypeAnchorEl(null);
    };

    const handleSubmenuClose = (value: number) => () => {
        console.log(`Selected Sub Option: ${value}`);
        if (selectedTrend) {
            const updatedTrends = trends.map(trend =>
                trend.start === selectedTrend.start && trend.end === selectedTrend.end
                    ? {
                        ...trend,
                        appearance: {
                            ...trend.appearance,
                            // edgeFill: color.hex,
                            strokeWidth: value
                        },
                    }
                    : trend
            );
            setTrends(updatedTrends);
            setSelectedTrend({
                ...selectedTrend,
                appearance: {
                    ...selectedTrend.appearance,
                    strokeWidth: value,
                }
            });
        }
        setSubmenuAnchorEl(null);
    };

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

    const onDrawCompleteStandardDeviationChannel = (e: React.MouseEvent, newChannels: any, moreProps: any) => {

        setEnableStandardDeviationChannel(false);
        setStandardDeviationChannel(newChannels)
    }

    const GanFanOnDrawComplete = (e: React.MouseEvent, newfans: any[], moreProps: any) => {
        // this gets called on
        // 1. draw complete of drawing object
        // 2. drag complete of drawing object
        setEnableGanFan(false)
        setFans(newfans)
    }

    const hexToRgba = (hex: string, alpha: number) => {
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;

        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    const colorsWithTransparency = [
        hexToRgba("#e41a1c", 0.3),
        hexToRgba("#377eb8", 0.3),
        hexToRgba("#4daf4a", 0.3),
        hexToRgba("#984ea3", 0.3),
        hexToRgba("#ff7f00", 0.3),
        hexToRgba("#ffff33", 0.3),
        hexToRgba("#a65628", 0.3),
        hexToRgba("#f781bf", 0.3)
    ];


    const isStudiesChartInclude = (chart: StudiesChart): boolean => {
        return studiesCharts.includes(chart)
    }

    const isStudiesChartWithTooltipInclude = (chart: StudiesChart): boolean => {
        return studiesChartsWithTooltip.includes(chart)
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

            const newStandardDeviationChannel = standardDeviationChannel.filter(each => !each.selected)

            setStandardDeviationChannel(newStandardDeviationChannel)

            const newGanFan = fans.filter(each => !each.selected)

            setFans(newGanFan)
        } else if (key === 'Escape') {
            // @ts-ignore
            canvasRef?.current?.cancelDrag()
            setEnableTrendLine(false)
            setEnableFib(false)
            setEnableEquidistant(false)
            setEnableStandardDeviationChannel(false)
            setEnableGanFan(false)
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

        // return macdCalculator(ema12(ema26(bb(initialData))))
        return macdCalculator(ema20(sma20(ema50(smaVolume50(ema12(ema26(bb(initialData))))))));

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

    const defaultSar = sar()
        .options({
            accelerationFactor, maxAccelerationFactor
        })
        .merge((d: any, c: any) => {
            d.sar = c;
        })
        .accessor((d: any) => d.sar);
    const calculatedData1 = defaultSar(initialData);


    const rsiCalculator = rsi()
        .options({windowSize: 14})
        .merge((d: any, c: any) => {
            d.rsi = c;
        })
        .accessor((d: any) => d.rsi);
    const calculatedData2 = rsiCalculator(initialData);

    const atr14 = atr()
        .options({windowSize: 14})
        .merge((d: any, c: any) => {
            d.atr14 = c;
        })
        .accessor((d: any) => d.atr14);
    const calculatedData3 = atr14(initialData);

    const fi = forceIndex()
        .merge((d: any, c: any) => {
            d.fi = c;
        })
        .accessor((d: any) => d.fi);
    const calculatedData4 = fi(initialData);

    const fiEMA13 = ema()
        .id(1)
        .options({windowSize: 13, sourcePath: "fi"})
        .merge((d: any, c: any) => {
            d.fiEMA13 = c;
        })
        .accessor((d: any) => d.fiEMA13);
    const calculatedData5 = fiEMA13(initialData);

    const elder = elderRay();

    const changeCalculator = change();
    const calculatedData6 = changeCalculator(elder(initialData));


    const slowSTO = stochasticOscillator()
        .options({windowSize: 14, kWindowSize: 3, dWindowSize: 4})
        .merge((d: any, c: any) => {
            d.slowSTO = c;
        })
        .accessor((d: any) => d.slowSTO);
    const calculatedData7 = slowSTO(elder(initialData));

    const fastSTO = stochasticOscillator()
        .options({windowSize: 14, kWindowSize: 1, dWindowSize: 4})
        .merge((d: any, c: any) => {
            d.fastSTO = c;
        })
        .accessor((d: any) => d.fastSTO);
    const calculatedData8 = fastSTO(elder(initialData));

    const fullSTO = stochasticOscillator()
        .options({windowSize: 14, kWindowSize: 3, dWindowSize: 4})
        .merge((d: any, c: any) => {
            d.fullSTO = c;
        })
        .accessor((d: any) => d.fullSTO);
    const calculatedData9 = fullSTO(elder(initialData));

    // const calculatedData10 = elderImpulseCalculator(macdCalculator(ema12(changeCalculator(initialData))));

    const showGrid = false;
    const xGrid = showGrid ? {innerTickSize: -1 * gridHeight, tickStrokeOpacity: 0.1} : {};

    const getStudiesChartOrigin = (chart: StudiesChart) => {
        return (studiesCharts.indexOf(chart) + 1) * studyChartHeight(studiesCharts)
    }

    const getStudiesChartTooltipOrigin = (chart: StudiesChart, yPosition = TOOLTIP_PADDING_LEFT, paddingTop = TOOLTIP_PADDING_TOP, height = TOOLTIP_HEIGHT) => {
        return [yPosition, studiesChartsWithTooltip.indexOf(chart) * height + paddingTop]
    }

    const getlastPrice = (d: any): number => {
        return initialData[initialData.length - 1].close;
    };

    const getlastPriceForColor = () : string => {
        const lastItem = initialData[initialData.length - 1];
        if (!lastItem){
            return '#ccc'
        }
        return lastItem.close > lastItem.open ? "#8cc176" : "#b82c0c";
    };

    const showTickLabel = (chart: StudiesChart) => {
        return studiesCharts.indexOf(chart) === 0
    }

    // const elderRayHeight = studyChartHeight(studiesCharts);
    const elderRayOrigin = (_: number, h: number) => [0, h - getStudiesChartOrigin(StudiesChart.ELDER_RAY)];
    const macdOrigin = (_: number, h: number) => [0, h - getStudiesChartOrigin(StudiesChart.MACD)];
    const rsiAndAtrOrigin = (_: number, h: number) => [0, h - getStudiesChartOrigin(StudiesChart.RSI_AND_ATR)];
    const forceIndexOrigin = (_: number, h: number) => [0, h - getStudiesChartOrigin(StudiesChart.FORCE_INDEX)];
    const stochasticOscillatorOrigin = (_: number, h: number) => [0, h - getStudiesChartOrigin(StudiesChart.STOCHASTIC_OSCILLATOR)];
    const barChartHeight = gridHeight / 4;
    // const barChartOrigin = (_: number, h: number) => [0, h - barChartHeight - elderRayHeight];
    // const barChartOrigin = (_: number, h: number) => [0, h - barChartHeight];
    // const chartHeight = gridHeight - elderRayHeight;
    const chartHeight = gridHeight - studiesCharts.length * studyChartHeight(studiesCharts);
    const barChartOrigin = (_: number, h: number) => [0, h - (studiesCharts.length + 1) * studyChartHeight(studiesCharts) - 5];
    const {disableVolume, setDisableVolume} = useStore();
    // const {disableElderRay, setDisableElderRay} = useStore();
    // const {disableMACD} = useStore();
    const {disableHoverTooltip} = useStore();
    // const {disableRSIAndATR} = useStore();
    // const {disableForceIndex} = useStore();
    // const {disableStochasticOscillator} = useStore();
    // const {disableOHLCSeries} = useStore();

    const timeDisplayFormat = timeFormat(HourAndMinutesTimeFrames.includes(timeFrame) ? "%H %M" : dateTimeFormat);
    const [openElderRayModal, setOpenElderRayModal] = useState<boolean>(false);


    const xAndYColors = {
        tickLabelFill: getDesignTokens(themeMode).palette.lineColor,
        tickStrokeStyle: getDesignTokens(themeMode).palette.lineColor,
        strokeStyle: getDesignTokens(themeMode).palette.lineColor,
        gridLinesStrokeStyle: getDesignTokens(themeMode).palette.grindLineColor,
    }

    const handleBrush1 = (brushCoords: any, moreProps: any) => {
        const {start, end} = brushCoords;
        const left = Math.min(start.xValue, end.xValue);
        const right = Math.max(start.xValue, end.xValue);

        const low = Math.min(start.yValue, end.yValue);
        const high = Math.max(start.yValue, end.yValue);

        // uncomment the line below to make the brush to zoom
        setXExtents([left, right])
        setYExtents1(BRUSH_TYPE === "2D" ? [low, high] : yExtents1)
        setEnableBrush(false)
        console.log(enableBrush)
        setXExtents([left, right])
        setYExtents1(BRUSH_TYPE === "2D" ? [low, high] : yExtents1)
        setEnableBrush(false)
    }

    const handleClickMovingAveragePop = (event: React.MouseEvent<SVGRectElement, MouseEvent>) => {
        setMovingAveragePopanchorEl(event.currentTarget);
    };

    const handleCloseMovingAveragePop = () => {
        setMovingAveragePopanchorEl(null);
    };

    const openMovingAveragePop = Boolean(movingAveragePopanchorEl);
    const movingAveragePopId = openMovingAveragePop ? 'simple-popover' : undefined;

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
            useCrossHairStyleCursor={!disableCrossHair}
        >
            /*##### Main Chart #####*/
            <Chart
                id={1}
                height={chartHeight}
                yExtents={candleChartExtents}
                // yExtents={[(d:any) => [d.high, d.low], sma20.accessor(), ema20.accessor(), ema50.accessor(), bb.accessor()]}

            >
                {/*<OHLCSeries strokeWidth={3}  stroke={d => elderImpulseCalculator.stroke()[d.elderImpulse]} yAccessor={(d) => ({ open: d.open, high: d.high, low: d.low, close: d.close })} />*/}
                {(isStudiesChartWithTooltipInclude(StudiesChart.ELDER_IMPULSE) || isStudiesChartInclude(StudiesChart.ELDER_RAY)) && (
                    <OHLCSeries strokeWidth={5}/>
                )}
                <SingleValueTooltip
                    yAccessor={getlastPrice}
                    yLabel={selectedSymbol}
                    fontSize={18}
                    yDisplayFormat={format(".2f")}
                    valueFill={getlastPriceForColor()}
                    /* labelStroke="#4682B4" - optional prop */
                    origin={[TOOLTIP_PADDING_LEFT, 35]}/>
                <XAxis showGridLines {...xAndYColors} />
                <YAxis showGridLines tickFormat={pricesDisplayFormat} {...xAndYColors} />

                {(!isStudiesChartInclude(StudiesChart.ELDER_RAY) && !isStudiesChartWithTooltipInclude(StudiesChart.ELDER_IMPULSE)) && (
                    <SelectedSeries series={seriesType} data={data}/>
                )}


                {isStudiesChartWithTooltipInclude(StudiesChart.MOVING_AVERAGE) && (
                    <div>
                        <LineSeries yAccessor={ema26.accessor()} strokeStyle={ema26.stroke()}/>
                        <CurrentCoordinate yAccessor={ema26.accessor()} fillStyle={ema26.stroke()}/>
                        <LineSeries yAccessor={ema12.accessor()} strokeStyle={ema12.stroke()}/>
                        <CurrentCoordinate yAccessor={ema12.accessor()} fillStyle={ema12.stroke()}/>
                    </div>
                )}

                {isStudiesChartWithTooltipInclude(StudiesChart.ELDER_IMPULSE) && (
                    <>
                        <div>
                            <LineSeries yAccessor={ema12.accessor()} strokeStyle={ema12.stroke()}/>
                            <CurrentCoordinate yAccessor={ema12.accessor()} fillStyle={ema12.stroke()}/>
                        </div>
                        <MovingAverageTooltip
                            textFill={getDesignTokens(themeMode).palette.text.primary}
                            onClick={handleClickMovingAveragePop}
                            origin={getStudiesChartTooltipOrigin(StudiesChart.ELDER_IMPULSE)}
                            options={[
                                {
                                    yAccessor: ema12.accessor(),
                                    type: "EMA",
                                    stroke: ema12.stroke(),
                                    windowSize: ema12.options().windowSize,
                                },
                            ]}
                        />
                    </>
                )}

                <MouseCoordinateX at="bottom" orient="bottom"
                                  displayFormat={timeFrame == TimeFrame.M1 ? timeFormat("%H-%M-%S") : timeFrame == TimeFrame.D ? timeFormat("%Y-%m-%d") : timeFormat("%Y-%m-%d")}/>
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

                {isStudiesChartWithTooltipInclude(StudiesChart.MOVING_AVERAGE) && (
                    <MovingAverageTooltip
                        textFill={getDesignTokens(themeMode).palette.text.primary}
                        onClick={handleClickMovingAveragePop}
                        origin={getStudiesChartTooltipOrigin(StudiesChart.MOVING_AVERAGE)}
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

                <Popover
                    id={movingAveragePopId}
                    open={openMovingAveragePop}
                    anchorEl={movingAveragePopanchorEl}
                    onClose={handleCloseMovingAveragePop}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                >
                    <ClickAwayListener onClickAway={handleCloseMovingAveragePop}>
                        <Box sx={{
                            bgcolor: getDesignTokens(themeMode).palette.chartBackground,
                            boxShadow: 24,
                            p: 2,
                            textAlign: 'center'
                        }}>
                            <Typography variant="h6" component="h2" sx={{ marginBottom: 2, fontSize: '1rem' }}>
                                changing
                            </Typography>
                            <Button
                                variant="contained"
                                color='error'
                                size='small'
                                title='disable MovingAverage'
                                onClick={() => {
                                    setStudiesChartsWithTooltip(studiesChartsWithTooltip.filter(item => item !== StudiesChart.MOVING_AVERAGE));
                                    handleCloseMovingAveragePop();
                                }}
                                sx={{ textTransform: 'none' }}
                            >
                                Disable MovingAverage
                            </Button>
                        </Box>
                    </ClickAwayListener>
                </Popover>

                <ZoomButtons onReset={handleReset}/>
                <OHLCTooltip origin={[8, 16]} textFill={getDesignTokens(themeMode).palette.text.primary}/>

                {isStudiesChartWithTooltipInclude(StudiesChart.BOLLINGER_BAND) && (
                    <>
                        <MovingAverageTooltip
                            textFill={getDesignTokens(themeMode).palette.text.primary}
                            onClick={e => console.log(e)}
                            origin={getStudiesChartTooltipOrigin(StudiesChart.BOLLINGER_BAND)}
                            options={[
                                {
                                    yAccessor: sma20.accessor(),
                                    type: sma20.type(),
                                    stroke: sma20.stroke(),
                                    windowSize: sma20.options().windowSize,
                                },
                                {
                                    yAccessor: ema20.accessor(),
                                    type: ema20.type(),
                                    stroke: ema20.stroke(),
                                    windowSize: ema20.options().windowSize,
                                },
                                {
                                    yAccessor: ema50.accessor(),
                                    type: ema50.type(),
                                    stroke: ema50.stroke(),
                                    windowSize: ema50.options().windowSize,
                                },
                            ]}
                        />
                        <BollingerBandTooltip
                            // @ts-ignore
                            origin={getStudiesChartTooltipOrigin(StudiesChart.BOLLINGER_BAND, 200, 55)}
                            yAccessor={d => d.bb}
                            options={bb.options()}
                            textFill={getDesignTokens(themeMode).palette.text.primary}/>

                        <LineSeries yAccessor={sma20.accessor()} strokeStyle={sma20.stroke()}/>
                        <LineSeries yAccessor={ema20.accessor()} strokeStyle={ema20.stroke()}/>
                        <LineSeries yAccessor={ema50.accessor()} strokeStyle={ema50.stroke()}/>
                        <CurrentCoordinate yAccessor={sma20.accessor()} fillStyle={sma20.stroke()}/>
                        <CurrentCoordinate yAccessor={ema20.accessor()} fillStyle={ema20.stroke()}/>
                        <CurrentCoordinate yAccessor={ema50.accessor()} fillStyle={ema50.stroke()}/>

                        <BollingerSeries yAccessor={d => d.bb}
                                         strokeStyle={bbStroke}
                                         fillStyle={bbFill}/>
                    </>
                )};

                /*##### Interactive #####*/
                <div onContextMenu={handleContextMenu}>
                    <TrendLine
                        enabled={enableTrendLine}
                        type="LINE"
                        snap={false}
                        snapTo={(d: any) => [d.high, d.low]}
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
                        trends={trends}

                    />

                    <Menu
                        keepMounted
                        open={contextMenuVisible}
                        onClose={handleClose}
                        anchorReference="anchorPosition"
                        anchorPosition={
                            menuPosition.mouseY !== null && menuPosition.mouseX !== null
                                ? {top: menuPosition.mouseY, left: menuPosition.mouseX}
                                : undefined
                        }
                    >
                        <ListItem button onClick={handleOpenColorPicker}>
                            <ListItemIcon>
                                <BorderColor fontSize="small"/>
                            </ListItemIcon>
                            <ListItemText onClick={handleOpenColorPicker}>Change Color</ListItemText>
                        </ListItem>
                        <ListItem button onClick={handleSubmenuClick}>
                            <ListItemIcon>
                                <EditIcon fontSize="small"/>
                            </ListItemIcon>
                            <ListItemText>StrokeWidth</ListItemText>
                        </ListItem>
                        <ListItem button onClick={handleTypeClick}>
                            <ListItemIcon>
                                <HorizontalRuleRoundedIcon fontSize="small"/>
                            </ListItemIcon>
                            <ListItemText>Type</ListItemText>
                        </ListItem>
                        <Menu
                            anchorEl={typeAnchorEl}
                            open={Boolean(typeAnchorEl)}
                            onClose={handleTypeClose}
                        >
                            <MenuItem>
                                <ListItemIcon onClick={handleTypeClose("XLINE")}>
                                    <HorizontalRuleRoundedIcon fontSize="small"/>
                                </ListItemIcon>
                                <ListItemText onClick={handleTypeClose("XLINE")}>XLINE</ListItemText>
                            </MenuItem>
                            <MenuItem>
                                <ListItemIcon onClick={handleTypeClose("RAY")}>
                                    <HorizontalRuleRoundedIcon fontSize="small"/>
                                </ListItemIcon>
                                <ListItemText onClick={handleTypeClose("RAY")}>RAY</ListItemText>
                            </MenuItem>
                            <MenuItem>
                                <ListItemIcon onClick={handleTypeClose("LINE")}>
                                    <HorizontalRuleRoundedIcon fontSize="small"/>
                                </ListItemIcon>
                                <ListItemText onClick={handleTypeClose("LINE")}>LINE</ListItemText>
                            </MenuItem>
                        </Menu>
                        <Menu
                            anchorEl={submenuAnchorEl}
                            open={Boolean(submenuAnchorEl)}
                            onClose={handleSubmenuClose}
                        >
                            <MenuItem>
                                <ListItemIcon onClick={handleSubmenuClose(1)}>
                                    <EditIcon fontSize="small"/>
                                </ListItemIcon>
                                <ListItemText onClick={handleSubmenuClose(1)}>1</ListItemText>
                            </MenuItem>
                            <MenuItem>
                                <ListItemIcon onClick={handleSubmenuClose(3)}>
                                    <EditIcon fontSize="medium"/>
                                </ListItemIcon>
                                <ListItemText onClick={handleSubmenuClose(3)}>3</ListItemText>
                            </MenuItem>
                            <MenuItem>
                                <ListItemIcon onClick={handleSubmenuClose(5)}>
                                    <EditIcon fontSize="large"/>
                                </ListItemIcon>
                                <ListItemText onClick={handleSubmenuClose(5)}>5</ListItemText>
                            </MenuItem>
                        </Menu>
                    </Menu>


                    <Popover
                        open={colorPickerVisible}
                        anchorEl={colorPickerAnchorEl}
                        onClose={handleCloseColorPicker}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                    >
                        <SketchPicker
                            color={selectedTrend?.appearance?.edgeFill || '#000'}
                            onChangeComplete={handleColorChange}
                        />
                    </Popover>
                </div>

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
                        stroke: getDesignTokens(themeMode).palette.lineColor,
                        strokeOpacity: 1,
                        strokeWidth: 1,
                        fill: "rgba(112, 176, 217, 0.4)",
                        fillOpacity: 0.1,
                        edgeStroke: getDesignTokens(themeMode).palette.edgeStroke,
                        edgeFill: getDesignTokens(themeMode).palette.lineColor,
                        edgeFill2: getDesignTokens(themeMode).palette.lineColor,
                        edgeStrokeWidth: 1,
                        r: 5,
                    }}
                />

                <StandardDeviationChannel
                    // ref={this.saveInteractiveNodes("StandardDeviationChannel", 1)}
                    enabled={enableStandardDeviationChannel}
                    onSelect={onDrawCompleteStandardDeviationChannel}
                    onStart={() => console.log("START")}
                    onComplete={onDrawCompleteStandardDeviationChannel}
                    channels={standardDeviationChannel}
                    appearance={{
                        stroke: getDesignTokens(themeMode).palette.lineColor,
                        strokeOpacity: 1,
                        strokeWidth: 1,
                        fill: "rgba(112, 176, 217, 0.4)",
                        fillOpacity: 0.1,
                        edgeStroke: getDesignTokens(themeMode).palette.edgeStroke,
                        edgeFill: getDesignTokens(themeMode).palette.lineColor,
                        edgeStrokeWidth: 1,
                        r: 5,
                    }}
                ></StandardDeviationChannel>

                <GannFan
                    // ref={this.saveInteractiveNodes("GannFan", 1)}
                    enabled={enableGanFan}
                    onStart={() => console.log("START")}
                    onComplete={GanFanOnDrawComplete}
                    fans={fans}
                    appearance={{
                        stroke: "#000000",
                        fillOpacity: 1,
                        strokeOpacity: 1,
                        strokeWidth: 1,
                        edgeStroke: "#000000",
                        edgeFill: "#FFFFFF",
                        edgeStrokeWidth: 1,
                        r: 5,
                        fill: colorsWithTransparency,
                        fontFamily: "-apple-system, system-ui, Roboto, 'Helvetica Neue', Ubuntu, sans-serif",
                        fontSize: 12,
                        fontFill: getDesignTokens(themeMode).palette.edgeStroke,
                    }}
                />

                <Brush
                    // ref={this.saveInteractiveNode(1)}
                    interactiveState={handleBrush1}
                    enabled={enableBrush}
                    fillStyle="rgba(112, 176, 217, 0.4)"
                    type={BRUSH_TYPE}
                    onBrush={handleBrush1}/>

                <InteractiveText
                    onChoosePosition={(e: React.MouseEvent, newText: any, moreProps: any) => {
                        onDrawComplete(newText, moreProps)
                    }}
                    // ref={saveNodeType("text")}
                    enabled={enableInteractiveObject}
                    onDragComplete={(e: React.MouseEvent, newText: any, moreProps: any) => {
                        onDrawComplete(newText, moreProps)
                    }}
                    textList={text}
                />

                {!disableHoverTooltip && (
                    <HoverTooltip
                        yAccessor={ema12.accessor()}
                        tooltip={{
                            content: ({currentItem, xAccessor}) => ({
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


                {isStudiesChartWithTooltipInclude(StudiesChart.SAR) && (
                    <>
                        <SARSeries yAccessor={d => d.sar} highlightOnHover/>
                        <MovingAverageTooltip
                            textFill={getDesignTokens(themeMode).palette.text.primary}
                            origin={getStudiesChartTooltipOrigin(StudiesChart.SAR, 2)}
                            options={[
                                {
                                    yAccessor: (d) => d.sar,
                                    type: `SAR (${accelerationFactor}, ${maxAccelerationFactor})`,
                                    stroke: '',
                                    windowSize: 0,
                                },
                            ]}
                        />
                    </>
                )}


            </Chart>

            /*##### Volume Chart #####*/
            {/*{volume.active && (*/}
            {!disableVolume && (
                <Chart
                    id={2}
                    height={barChartHeight}
                    origin={barChartOrigin}
                    yExtents={barChartExtents}
                    // yExtents={[d => d.volume, smaVolume50.accessor()]}
                >
                    <BarSeries fillStyle={volumeColor} yAccessor={d => d.volume}/>
                    {/*<AreaSeries yAccessor={smaVolume50.accessor()} {...volumeAppearance} />*/}
                </Chart>
            )}
            {/*)}*/}

            /*##### ElderRay Chart #####*/
            {isStudiesChartInclude(StudiesChart.ELDER_RAY) &&

            // <ElderRayStudiesChart
            //     yExtents={[0, elder.accessor()]}
            //     displayFormat={timeDisplayFormat}
            //     margin={margin}
            //     pricesDisplayFormat={pricesDisplayFormat}
            //     elderAccessor={elder.accessor()}
            //     origin={elderRayOrigin}
            // />

            (
                <Chart id={3} height={studyChartHeight(studiesCharts)} yExtents={[0, elder.accessor()]} origin={elderRayOrigin}
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
                        valueFill={getDesignTokens(themeMode).palette.text.primary}
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
                                setStudiesCharts(studiesCharts.filter(item => item !== StudiesChart.ELDER_RAY))
                                setOpenElderRayModal(false)
                            }}> disable ElderRay </Button>
                        </Box>
                    </Modal>
                </Chart>
            )
            }

            /*##### MACD Chart #####*/
            {isStudiesChartInclude(StudiesChart.MACD) && (
                <Chart id={4} height={studyChartHeight(studiesCharts)}
                       yExtents={macdCalculator.accessor()}
                       origin={macdOrigin} padding={{top: 10, bottom: 10}}
                >
                    <XAxis axisAt="bottom" orient="bottom" {...xAndYColors}
                           showTickLabel={showTickLabel(StudiesChart.MACD)}/>
                    <YAxis axisAt="right" orient="right" {...xAndYColors} ticks={2}/>

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
            {isStudiesChartInclude(StudiesChart.RSI_AND_ATR) && (
                <Chart id={5}
                       yExtents={rsiCalculator.accessor()}
                       height={studyChartHeight(studiesCharts)}
                       origin={rsiAndAtrOrigin} padding={{top: 10, bottom: 10}}

                >
                    <XAxis axisAt="bottom" orient="bottom" showTicks={false} outerTickSize={0} {...xAndYColors}
                           showTickLabel={showTickLabel(StudiesChart.RSI_AND_ATR)}/>
                    <YAxis axisAt="right"
                           orient="right"
                           {...xAndYColors}
                           tickValues={[30, 50, 70]}/>
                    <MouseCoordinateY
                        at="right"
                        orient="right"
                        displayFormat={format(".2f")}/>

                    <RSISeries yAccessor={d => d.rsi}/>

                    <RSITooltip origin={[8, 36]}
                                textFill={getDesignTokens(themeMode).palette.text.primary}
                                yAccessor={d => d.rsi}
                                options={rsiCalculator.options()}/>
                </Chart>
            )}
            {isStudiesChartInclude(StudiesChart.RSI_AND_ATR) && (
                <Chart id={6}
                       yExtents={atr14.accessor()}
                       height={studyChartHeight(studiesCharts)} origin={rsiAndAtrOrigin} padding={{top: 10, bottom: 10}}
                >
                    <XAxis axisAt="bottom" orient="bottom" {...xAndYColors}
                           showTickLabel={showTickLabel(StudiesChart.RSI_AND_ATR)}/>
                    <YAxis axisAt="right" orient="right" {...xAndYColors} ticks={2}/>

                    <MouseCoordinateX
                        at="bottom"
                        orient="bottom"
                        displayFormat={timeFormat("%Y-%m-%d")}/>
                    <MouseCoordinateY
                        at="right"
                        orient="right"
                        displayFormat={format(".2f")}/>

                    <LineSeries yAccessor={atr14.accessor()} strokeStyle={atr14.stroke()}/>
                    <SingleValueTooltip
                        valueFill={getDesignTokens(themeMode).palette.text.primary}
                        yAccessor={atr14.accessor()}
                        yLabel={`ATR (${atr14.options().windowSize})`}
                        yDisplayFormat={format(".2f")}
                        /* valueStroke={atr14.stroke()} - optional prop */
                        /* labelStroke="#4682B4" - optional prop */
                        origin={[8, 80]}/>
                </Chart>
            )}
            {isStudiesChartInclude(StudiesChart.FORCE_INDEX) && (
                <Chart id={7} height={studyChartHeight(studiesCharts)}
                       yExtents={fi.accessor()}
                       origin={forceIndexOrigin}
                       padding={{top: 10, bottom: 10}}
                >
                    <XAxis axisAt="bottom" orient="bottom" showTicks={false} outerTickSize={0} {...xAndYColors}
                           showTickLabel={showTickLabel(StudiesChart.FORCE_INDEX)}/>
                    <YAxis axisAt="right" orient="right" ticks={4} tickFormat={format(".2s")} {...xAndYColors}/>
                    <MouseCoordinateY
                        at="right"
                        orient="right"
                        displayFormat={format(".4s")}/>

                    <AreaSeries baseAt={(scale) => scale(0)} yAccessor={fi.accessor()}/>
                    <StraightLine yValue={0}/>

                    <SingleValueTooltip
                        yAccessor={fi.accessor()}
                        valueFill={getDesignTokens(themeMode).palette.text.primary}
                        yLabel="ForceIndex (1)"
                        yDisplayFormat={format(".4s")}
                        origin={[8, 80]}
                    />
                </Chart>
            )}
            {isStudiesChartInclude(StudiesChart.FORCE_INDEX) && (
                <Chart id={8} height={studyChartHeight(studiesCharts)}
                       yExtents={fiEMA13.accessor()}
                       origin={forceIndexOrigin}
                       padding={{top: 10, bottom: 10}}
                >
                    <XAxis axisAt="bottom" orient="bottom" {...xAndYColors}
                           showTickLabel={showTickLabel(StudiesChart.FORCE_INDEX)}/>
                    <YAxis axisAt="right" orient="right" ticks={4} tickFormat={format(".2s")} {...xAndYColors}/>

                    <MouseCoordinateX
                        at="bottom"
                        orient="bottom"
                        displayFormat={timeFormat("%Y-%m-%d")}/>
                    <MouseCoordinateY
                        at="right"
                        orient="right"
                        displayFormat={format(".4s")}/>

                    {/* <AreaSeries baseAt={scale => scale(0)} yAccessor={fiEMA13.accessor()} /> */}
                    <AlternatingFillAreaSeries
                        baseAt={0}
                        yAccessor={fiEMA13.accessor()}
                    />
                    <StraightLine yValue={0}/>

                    <SingleValueTooltip
                        yAccessor={fiEMA13.accessor()}
                        valueFill={getDesignTokens(themeMode).palette.text.primary}
                        yLabel={`ForceIndex (${fiEMA13.options().windowSize})`}
                        yDisplayFormat={format(".4s")}
                        origin={[8, 36]}
                    />
                </Chart>
            )}
            {isStudiesChartInclude(StudiesChart.STOCHASTIC_OSCILLATOR) && (
                <Chart id={9}
                       yExtents={[0, 100]}
                       height={studyChartHeight(studiesCharts)} origin={stochasticOscillatorOrigin} padding={{top: 10, bottom: 10}}
                >
                    <XAxis axisAt="bottom" orient="bottom" showTicks={false} outerTickSize={0} {...xAndYColors}
                           showTickLabel={showTickLabel(StudiesChart.STOCHASTIC_OSCILLATOR)}/>
                    <YAxis axisAt="right" orient="right"
                           {...xAndYColors}
                           tickValues={[20, 50, 80]}/>
                    <MouseCoordinateY
                        at="right"
                        orient="right"
                        displayFormat={format(".2f")}/>

                    <StochasticSeries
                        yAccessor={d => d.fastSTO}
                        {...stoAppearance} />
                    <StochasticTooltip
                        origin={[-38, 15]}
                        yAccessor={d => d.slowSTO}
                        options={slowSTO.options()}
                        appearance={stoAppearance}
                        label="Slow STO"/>

                </Chart>
            )}
            {isStudiesChartInclude(StudiesChart.STOCHASTIC_OSCILLATOR) && (
                <Chart id={10}
                       yExtents={[0, 100]}
                       height={studyChartHeight(studiesCharts)} origin={stochasticOscillatorOrigin} padding={{top: 10, bottom: 10}}
                >
                    <XAxis axisAt="bottom" orient="bottom" showTicks={false} outerTickSize={0} {...xAndYColors}
                           showTickLabel={showTickLabel(StudiesChart.STOCHASTIC_OSCILLATOR)}/>
                    <YAxis axisAt="right" orient="right"
                           {...xAndYColors}
                           tickValues={[20, 50, 80]}/>

                    <MouseCoordinateY
                        at="right"
                        orient="right"
                        displayFormat={format(".2f")}/>

                    <StochasticSeries
                        yAccessor={d => d.slowSTO}
                        {...stoAppearance} />

                    <StochasticTooltip
                        origin={[-38, 15]}
                        yAccessor={d => d.fastSTO}
                        options={fastSTO.options()}
                        appearance={stoAppearance}
                        label="Fast STO"/>
                </Chart>
            )}
            {isStudiesChartInclude(StudiesChart.STOCHASTIC_OSCILLATOR) && (
                <Chart id={11}
                       yExtents={[0, 100]}
                       height={studyChartHeight(studiesCharts)} origin={stochasticOscillatorOrigin} padding={{top: 10, bottom: 10}}
                >
                    <XAxis axisAt="bottom" orient="bottom" {...xGrid} {...xAndYColors}
                           showTickLabel={showTickLabel(StudiesChart.STOCHASTIC_OSCILLATOR)}/>
                    <YAxis axisAt="right" orient="right"
                           {...xAndYColors}
                           tickValues={[20, 50, 80]}/>

                    <MouseCoordinateX
                        at="bottom"
                        orient="bottom"
                        displayFormat={timeFormat("%Y-%m-%d")}/>
                    <MouseCoordinateY
                        at="right"
                        orient="right"
                        displayFormat={format(".2f")}/>
                    <StochasticSeries
                        yAccessor={d => d.fullSTO}
                        {...stoAppearance} />

                    <StochasticTooltip
                        origin={[-38, 15]}
                        yAccessor={d => d.fullSTO}
                        options={fullSTO.options()}
                        appearance={stoAppearance}
                        label="Full STO"/>
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

            {!disableCrossHair && (
                <CrossHairCursor/>
            )}
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

