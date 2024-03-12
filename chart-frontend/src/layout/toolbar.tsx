import React from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import useStore from "../util/store";
import {Button, Switch} from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";


const Toolbar = (props: any) => {

    const { setSymbol, timeFrame, setTimeFrame, themeMode, setThemeMode } = useStore();
    const { enableTrendLine, setEnableTrendLine } = useStore();
    const { enableFib, setEnableFib } = useStore();

    return (
        <div className="toolbar" style={props.style}>

            <Switch onChange={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
                    icon={<LightModeIcon />}
                    checkedIcon={<DarkModeIcon />}
                    classes={{root: 'change-theme-switch', checked: 'change-theme-switch-checked'}}
            />

            <Select
                labelId="demo-select-small-label"
                defaultValue='d'
                classes={{root: 'toolbar-select'}}
                // @ts-ignore
                onChange={(event) => setTimeFrame(event?.target?.value)}
            >
                <MenuItem value='d'>daily</MenuItem>
                <MenuItem value='1m'>minutes</MenuItem>
                <MenuItem value='SECONDS'>seconds</MenuItem>
            </Select>

            <Select
                labelId="demo-select-small-label"
                defaultValue='BTC-USD.CC'
                classes={{root: 'toolbar-select'}}
                // @ts-ignore
                onChange={(event) => setSymbol(event?.target?.value)}
            >
                <MenuItem value='BTC-USD.CC'>Bitcoin</MenuItem>
                <MenuItem value='ttr'>Tether</MenuItem>
                <MenuItem value='AAPL'>Apple</MenuItem>
            </Select>

            <Button
                onClick={() => setEnableTrendLine(!enableTrendLine)}
            >
                TrendLine
            </Button>

            <Button
                onClick={() => setEnableFib(!enableFib)}
            >
                Fibonacci
            </Button>
        </div>
    )
}

export default Toolbar;
