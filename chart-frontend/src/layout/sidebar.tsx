import React from 'react';
import {IconButton, Tooltip} from "@mui/material";
import {DensityMedium, HorizontalRule} from '@mui/icons-material';
import useStore from "../util/store";

const Sidebar = (props: any) => {

    const {enableTrendLine, setEnableTrendLine} = useStore();
    const {enableFib, setEnableFib} = useStore();

    return (
        <div className="sidebar" style={props.style}>

            <Tooltip title="Trend line" placement="right" arrow>
                <IconButton
                    sx={{
                        background: enableTrendLine ? '#025394' : 'transparent'
                    }}
                    onClick={() => {
                        setEnableTrendLine(!enableTrendLine)
                        setEnableFib(false)
                    }}
                >
                    <HorizontalRule/>
                </IconButton>
            </Tooltip>

            <Tooltip title="Fibonatchi" placement="right" arrow>
                <IconButton
                    sx={{
                        background: enableFib ? '#025394' : 'transparent'
                    }}
                    onClick={() => {
                        setEnableFib(!enableFib)
                        setEnableTrendLine(false)
                    }}
                >
                    <DensityMedium/>
                </IconButton>
            </Tooltip>

        </div>
    )
}

export default Sidebar;
