import React from 'react';
import {IconButton, Tooltip} from "@mui/material";
import TrendLineIcon from "../icons/TrendLineIcon";
import FibonacciIcon from "../icons/FibonacciIcon";
import useDesignStore from "../util/designStore";

const Sidebar = (props: any) => {

    const {enableTrendLine, setEnableTrendLine} = useDesignStore();
    const {enableFib, setEnableFib} = useDesignStore();

    const {themeSecondaryColor} = useDesignStore();

    return (
        <div className="sidebar" style={props.style}>

            <Tooltip title="Trend line" placement="right" arrow>
                <IconButton
                    onClick={() => {
                        setEnableTrendLine(!enableTrendLine)
                        setEnableFib(false)
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
                    }}
                >
                    <FibonacciIcon selected={enableFib} color={themeSecondaryColor} />
                </IconButton>
            </Tooltip>

        </div>
    )
}

export default Sidebar;
