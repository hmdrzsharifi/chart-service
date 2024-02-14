import React from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import useStore from "../util/store";
import {Switch} from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";


const Toolbar = (props: any) => {

    const { durationData, setDurationData, themeMode, setThemeMode } = useStore();

    return (
        <div className="toolbar" style={props.style}>

            <Switch onChange={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
                    icon={<LightModeIcon />}
                    checkedIcon={<DarkModeIcon />}
                    classes={{root: 'change-theme-switch', checked: 'change-theme-switch-checked'}}
            />

            <Select
                labelId="demo-select-small-label"
                defaultValue='DAILY'
                classes={{root: 'toolbar-select'}}
                // @ts-ignore
                onChange={(event) => setDurationData(event?.target?.value)}
            >
                <MenuItem value='DAILY'>daily</MenuItem>
                <MenuItem value='MINUTES'>minutes</MenuItem>
                <MenuItem value='SECONDS'>seconds</MenuItem>
            </Select>
        </div>
    )
}

export default Toolbar;
