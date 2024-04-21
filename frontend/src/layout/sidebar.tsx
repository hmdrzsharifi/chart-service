import React from 'react';
import {IconButton, Tooltip} from "@mui/material";
import TrendLineIcon from "../icons/TrendLineIcon";
import FibonacciIcon from "../icons/FibonacciIcon";
import useDesignStore from "../util/designStore";

const Sidebar = (props: any) => {

    const {enableTrendLine, setEnableTrendLine} = useDesignStore();
    const {enableFib, setEnableFib} = useDesignStore();
    const {enableEquidistant, setEnableEquidistant} = useDesignStore();
    const {enableBrush, setEnableBrush} = useDesignStore();


    const {themeSecondaryColor} = useDesignStore();

    return (
        <div className="sidebar" style={props.style}>

            <Tooltip title="Trend line" placement="right" arrow>
                <IconButton
                    onClick={() => {
                        setEnableTrendLine(!enableTrendLine)
                        setEnableFib(false)
                        setEnableEquidistant(false)
                        setEnableBrush(false)
                    }}
                >
                    <TrendLineIcon selected={enableTrendLine} color={themeSecondaryColor} />
                </IconButton>
            </Tooltip>

            <Tooltip title="Fibonacci" placement="right" arrow>
                <IconButton
                    onClick={() => {
                        setEnableFib(!enableFib)
                        setEnableTrendLine(false)
                        setEnableEquidistant(false)
                        setEnableBrush(false)
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

                    }}
                >
                    <TrendLineIcon selected={enableEquidistant} color={themeSecondaryColor} />
                </IconButton>
            </Tooltip>

            <Tooltip title="Equidistant Channel" placement="right" arrow>
                <IconButton
                    onClick={() => {
                        setEnableBrush(!enableBrush)
                        setEnableEquidistant(false)
                        setEnableTrendLine(false)
                        setEnableFib(false)
                    }}
                >
                    <FibonacciIcon selected={enableEquidistant} color={themeSecondaryColor} />
                </IconButton>
            </Tooltip>


        </div>
    )
}

export default Sidebar;
