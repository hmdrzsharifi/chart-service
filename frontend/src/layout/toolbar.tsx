import React from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import useStore from "../util/store";
import {Tooltip, IconButton, Switch} from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import ExpandMore from "@mui/icons-material/ExpandMore";
import CandleIcon from "../icons/CandleIcon";
import BarIcon from "../icons/BarIcon";
import LineIcon from "../icons/LineIcon";
import useDesignStore from "../util/designStore";
import EditNoteIcon from '@mui/icons-material/EditNote';
import { Series } from "../type/Enum";
import BaseLineIcon from "../icons/BaseLineIcon";
import AreaIcon from "../icons/AreaIcon";

const Toolbar = (props: any) => {

    const {setSymbol} = useStore();
    const {setSeriesType} = useStore();
    const {setThemeSecondaryColor} = useDesignStore();
    const {themeMode, setThemeMode, openSideBar, setOpenSideBar} = useDesignStore();

    return (
        <div className="toolbar" style={props.style}>

            <div className="toolbar-left-box">
                <Tooltip title="Draw line" placement="bottom" arrow>
                    <IconButton
                        sx={{ padding: '5px' }}
                        onClick={() => setOpenSideBar(!openSideBar)}
                    >
                        <EditNoteIcon sx={{ width: 30, height: 30 }} />
                    </IconButton>
                </Tooltip>
            </div>
            <div className="toolbar-right-box">
                <Switch onChange={() => {
                    setThemeSecondaryColor(themeMode === 'dark' ? '#000' : '#fff')
                    setThemeMode(themeMode === 'dark' ? 'light' : 'dark')
                }
                }
                        icon={<LightModeIcon />}
                        checkedIcon={<DarkModeIcon />}
                        classes={{root: 'change-theme-switch', checked: 'change-theme-switch-checked'}}
                />

                <Select
                    labelId="demo-select-small-label"
                    defaultValue='AAPL'
                    classes={{root: 'toolbar-select'}}
                    IconComponent={ExpandMore}
                    // @ts-ignore
                    onChange={(event) => setSymbol(event?.target?.value)}
                >
                    <MenuItem value='AAPL'>Apple</MenuItem>
                    <MenuItem value='BINANCE:BTCUSDT'>Bitcoin</MenuItem>
                    <MenuItem value='AMZN'>Amazon</MenuItem>
                </Select>

                <Select
                    labelId="demo-select-small-label"
                    defaultValue={Series.CANDLE}
                    classes={{root: 'toolbar-select', select: 'toolbar-chart-icon'}}
                    IconComponent={ExpandMore}
                    // @ts-ignore
                    onChange={(event) => setSeriesType(event?.target?.value)}
                >
                    <MenuItem value={Series.CANDLE}><CandleIcon/> <span className='toolbar-chart-item'>Candle</span></MenuItem>
                    <MenuItem value={Series.BAR}><BarIcon/> <span className='toolbar-chart-item'>Bar</span></MenuItem>
                    <MenuItem value={Series.LINE}><LineIcon/> <span className='toolbar-chart-item'>Line</span></MenuItem>
                    <MenuItem value={Series.AREA}><AreaIcon/> <span className='toolbar-chart-item'>Area</span></MenuItem>
                    <MenuItem value={Series.BASE_LINE}><BaseLineIcon/> <span className='toolbar-chart-item'>Base Line</span></MenuItem>
                </Select>

            </div>






        </div>
    )
}

export default Toolbar;
