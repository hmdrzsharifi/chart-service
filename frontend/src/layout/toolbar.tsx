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
                defaultValue='D'
                classes={{root: 'toolbar-select'}}
                // @ts-ignore
                onChange={(event) => setTimeFrame(event?.target?.value)}
            >
                <MenuItem value='D'>1 D</MenuItem>
                <MenuItem value='1M'>1 Min</MenuItem>
                <MenuItem value='5M'>5 Min</MenuItem>
                <MenuItem value='15M'>15 Min</MenuItem>
                <MenuItem value='30M'>30 Min</MenuItem>
                <MenuItem value='1H'>1 Hour</MenuItem>
                <MenuItem value='W'>1 W</MenuItem>
                <MenuItem value='M'>1M</MenuItem>
            </Select>

            <Select
                labelId="demo-select-small-label"
                defaultValue='AAPL'
                classes={{root: 'toolbar-select'}}
                // @ts-ignore
                onChange={(event) => setSymbol(event?.target?.value)}
            >
                <MenuItem value='AAPL'>Apple</MenuItem>
                <MenuItem value='BINANCE:BTCUSDT'>Bitcoin</MenuItem>
                <MenuItem value='AMZN'>Amazon</MenuItem>
            </Select>

        </div>
    )
}

export default Toolbar;
