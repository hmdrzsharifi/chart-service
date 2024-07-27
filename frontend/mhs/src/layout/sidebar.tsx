import React from 'react';
import {IconButton, Tooltip} from "@mui/material";
import TrendLineIcon from "../icons/TrendLineIcon";
import FibonacciIcon from "../icons/FibonacciIcon";
import useDesignStore from "../util/designStore";
import Brush from "../icons/Brush";
import EquidistantChannel from "../icons/EquidistantChannel";
import InteractiveText from "../icons/InteractiveText";
import StandardDeviationChannel from "../icons/StandardDeviationChannel";
import GanFan from "../icons/GanFan";

const Sidebar = (props: any) => {

    const {enableTrendLine, setEnableTrendLine} = useDesignStore();
    const {enableFib, setEnableFib} = useDesignStore();
    const {enableEquidistant, setEnableEquidistant} = useDesignStore();
    const {enableBrush, setEnableBrush} = useDesignStore();
    const {enableInteractiveObject, setEnableInteractiveObject} = useDesignStore();
    const {enableStandardDeviationChannel, setEnableStandardDeviationChannel} = useDesignStore();
    const {enableGanFan, setEnableGanFan} = useDesignStore();


    const {themeSecondaryColor} = useDesignStore();

    return (
        <div className="sidebar" style={props.style}>

            <Tooltip title="Trendline" placement="right" arrow>
                <IconButton
                    onClick={() => {
                        setEnableTrendLine(!enableTrendLine)
                        setEnableFib(false)
                        setEnableEquidistant(false)
                        setEnableBrush(false)
                        setEnableInteractiveObject(false)
                    }}
                >
                    <TrendLineIcon selected={enableTrendLine} color={themeSecondaryColor} />
                </IconButton>
            </Tooltip>

            <Tooltip title="Fibonacci Retracement" placement="right" arrow>
                <IconButton
                    onClick={() => {
                        setEnableFib(!enableFib)
                        setEnableTrendLine(false)
                        setEnableEquidistant(false)
                        setEnableBrush(false)
                        setEnableInteractiveObject(false)
                    }}
                >
                    <FibonacciIcon selected={enableFib} color={themeSecondaryColor} />
                </IconButton>
            </Tooltip>

            <Tooltip title="Equidistant Channel" placement="right" arrow>
                <IconButton
                    onClick={() => {
                        setEnableEquidistant(!enableEquidistant)
                        setEnableTrendLine(false)
                        setEnableFib(false)
                        setEnableBrush(false)
                        setEnableInteractiveObject(false)
                    }}
                >
                    <EquidistantChannel selected={enableEquidistant} color={themeSecondaryColor} />
                </IconButton>
            </Tooltip>

            <Tooltip title="StandardDeviation Channel" placement="right" arrow>
                <IconButton
                    onClick={() => {
                        setEnableStandardDeviationChannel(!enableStandardDeviationChannel)
                        setEnableTrendLine(false)
                        setEnableFib(false)
                        setEnableBrush(false)
                        setEnableInteractiveObject(false)
                    }}
                >
                    <StandardDeviationChannel selected={enableStandardDeviationChannel} color={themeSecondaryColor} />
                </IconButton>
            </Tooltip>

            <Tooltip title="GanFan" placement="right" arrow>
                <IconButton
                    onClick={() => {
                        setEnableGanFan(!enableGanFan)
                        setEnableTrendLine(false)
                        setEnableFib(false)
                        setEnableBrush(false)
                        setEnableInteractiveObject(false)
                    }}
                >
                    <GanFan selected={enableGanFan} color={themeSecondaryColor} />
                </IconButton>
            </Tooltip>

            {/*<Tooltip title="Brush" placement="right" arrow>
                <IconButton
                    onClick={() => {
                        setEnableBrush(!enableBrush)
                        setEnableEquidistant(false)
                        setEnableTrendLine(false)
                        setEnableFib(false)
                        setEnableInteractiveObject(false)
                    }}
                >
                    <Brush selected={enableEquidistant} color={themeSecondaryColor} />
                </IconButton>
            </Tooltip>*/}

            {/*<Tooltip title="InteractiveText" placement="right" arrow>
                <IconButton
                    onClick={() => {
                        setEnableInteractiveObject(!enableInteractiveObject)
                        console.log(enableInteractiveObject)
                        setEnableEquidistant(false)
                        setEnableTrendLine(false)
                        setEnableFib(false)
                        setEnableBrush(false)
                    }}
                >
                    <InteractiveText selected={enableEquidistant} color={themeSecondaryColor} />
                </IconButton>
            </Tooltip>*/}

        </div>
    )
}

export default Sidebar;
