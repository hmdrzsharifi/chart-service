import React from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import useStore from "../util/store";
import {Switch} from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";


const Toolbar = (props: any) => {

    const { setSymbol, themeMode, setThemeMode } = useStore();

    return (
        <div className="toolbar" style={props.style}>

            <Switch onChange={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
                    icon={<LightModeIcon />}
                    checkedIcon={<DarkModeIcon />}
                    classes={{root: 'change-theme-switch', checked: 'change-theme-switch-checked'}}
            />

            <Select
                labelId="demo-select-small-label"
                defaultValue='btc'
                classes={{root: 'toolbar-select'}}
                // @ts-ignore
                onChange={(event) => setSymbol(event?.target?.value)}
            >
                <MenuItem value='btc'>Bitcoin</MenuItem>
                <MenuItem value='ttr'>Tether</MenuItem>
            </Select>
        </div>
    )
}

export default Toolbar;
