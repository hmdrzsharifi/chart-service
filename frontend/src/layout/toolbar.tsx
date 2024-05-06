import React , {useState} from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import useStore from "../util/store";
import {
    Tooltip,
    IconButton,
    Switch,
    TextField,
    Tabs,
    Tab,
    List,
    ListItem,
    Autocomplete, Grid, Avatar, Menu, Checkbox, ToggleButton
} from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import ExpandMore from "@mui/icons-material/ExpandMore";
import CandleIcon from "../icons/CandleIcon";
import BarIcon from "../icons/BarIcon";
import LineIcon from "../icons/LineIcon";
import useDesignStore from "../util/designStore";
import EditNoteIcon from '@mui/icons-material/EditNote';
import {Series, TimeFrame} from "../type/Enum";
import BaseLineIcon from "../icons/BaseLineIcon";
import AreaIcon from "../icons/AreaIcon";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Scrollbar from 'react-scrollbars-custom';
import {Close, Info, Message, Search, SmartButton} from "@mui/icons-material";
import {SymbolList, SymbolType} from "../type/SymbolType";
import {fetchCandleData, fetchCexSymbols, fetchSymbolData} from "../util/utils";

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const Toolbar = (props: any) => {

    const {setSymbol} = useStore();
    const {setSeriesType} = useStore();
    const {setThemeSecondaryColor} = useDesignStore();
    const {themeMode, setThemeMode, openSideBar, setOpenSideBar} = useDesignStore();
    const [open, setOpen] = useState<boolean>(false);
    const [openInfoModal, setOpenInfoModal] = useState<boolean>(false);
    const [tabValue, setTabValue] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [options, setOptions] = useState<number[]>([]);
    const [symbolList, setSymbolList] = useState<SymbolList[]>([]);
    const {selectedSymbol , setSelectedSymbol} = useStore();
    const [menuOpen, setMenuOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<any>(null);
    const {disableMovingAverage,setDisableMovingAverage} = useStore();
    const {disableElderRay,setDisableElderRay} = useStore();
    const {timeFrame, setTimeFrame} = useStore();
    const {disableHoverTooltip, setDisableHoverTooltip} = useStore();
    const {disableMACD, setDisableMACD} = useStore();


    const handleMenuToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
        setMenuOpen(!menuOpen);
        setAnchorEl(event.currentTarget);
    };

    const handleOpen = async () => {
        setOpen(true)
        const symboleData = await fetchCexSymbols()
        setSymbolList(symboleData)
    };

    const handleClose = () => setOpen(false);
    const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue)
    };
    const handleSearch = (event: React.ChangeEvent<{}>, value: string) => {
        console.log({event})
        console.log({value})
        setSearchTerm(value);
    };

    const sendToApp = async (item: any) => {
        console.log({item})
        // const symbolData = await fetchSymbolData(item.symbol);
        // setSymbolList(candleData);
        setSelectedSymbol(item)
        handleClose()
    }


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
                <Tooltip title="Info" placement="bottom" arrow>
                  <ToggleButton value="left" size="small" aria-label="Small sizes" selected={disableHoverTooltip}
                                onChange={() => {
                                    setDisableHoverTooltip(!disableHoverTooltip);
                                }}>
                      <Message />
                  </ToggleButton>
                </Tooltip>
                <Tooltip title="Search Symbol" placement="bottom" arrow>
                <IconButton onClick={handleOpen}>
                    <Search />
                </IconButton>
                </Tooltip>
                <span onClick={handleOpen} style={{cursor:'pointer' , fontWeight:'bolder'}}>
                {selectedSymbol?.displaySymbol}
                </span>
                <Modal
                    open={open}
                    onClose={handleClose}
                    sx={{ maxHeight: '95%' }}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
                        <Typography id="modal-modal-title" variant="h6" component="h2">
                            Select Symbol
                        </Typography>
                        <IconButton aria-label='close' onClick={handleClose} style={{position:'absolute' , top:'10px' , right:'10px'}}>
                            <Close />
                        </IconButton>
                        <Autocomplete
                            freeSolo
                            options={options}
                            renderInput={(params) => <TextField {...params} label="Search" variant="outlined" />}
                            onInputChange={(event, value) => handleSearch(event , value)}
                        />
                        <Tabs value={tabValue} onChange={handleChangeTab} sx={{ mt: 2 }}>
                            <Tab label="all" />
                            <Tab label="crypto" />
                        </Tabs>
                        <Scrollbar style={{ height: 300 }}>
                        {tabValue === 0 && (
                            <List>
                                {symbolList.filter((item : SymbolList) => item.symbol.toString().toLowerCase().includes(searchTerm)).map((item:SymbolList) => (
                                    <ListItem className='element' key={item.symbol} onClick={(e) => sendToApp(item)} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{item.categoryName}</span>
                                        <span>{item.symbol}</span>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                        {tabValue === 1 && (
                            <List sx={{ mt: 2 }}>
                                {symbolList.filter((item : SymbolList) => item.categoryName.startsWith('CRT') && item.symbol.toString().toLowerCase().includes(searchTerm)).map((item:SymbolList) => (
                                    <ListItem className='element' key={item.symbol} onClick={(e) => sendToApp(item)} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{item.categoryName}</span>
                                        <span>{item.symbol}</span>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                        </Scrollbar>
                        <Button onClick={handleClose} sx={{ mt: 2 }}>Close</Button>
                    </Box>
                </Modal>
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
                    defaultValue='BTC_USD'
                    classes={{root: 'toolbar-select'}}
                    IconComponent={ExpandMore}
                    // @ts-ignore
                    onChange={(event) => setSymbol(event?.target?.value)}
                >
                    {/*<MenuItem value='AAPL'>Apple</MenuItem>*/}
                    {/*<MenuItem value='BINANCE:BTCUSDT'>Bitcoin</MenuItem>*/}
                    <MenuItem value='BTC_USD'>Bitcoin</MenuItem>
                    {/*<MenuItem value='AMZN'>Amazon</MenuItem>*/}
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

                <Select
                    labelId="demo-select-small-label"
                    defaultValue={timeFrame}
                    classes={{root: 'toolbar-select'}}
                    IconComponent={ExpandMore}
                    // @ts-ignore
                    onChange={(event) => setTimeFrame(event?.target?.value)}
                >
                    <MenuItem value={TimeFrame.D}><span className='toolbar-chart-item'>D</span></MenuItem>
                    <MenuItem value={TimeFrame.M1}><span className='toolbar-chart-item'>1M</span></MenuItem>
                    <MenuItem value={TimeFrame.M5}><span className='toolbar-chart-item'>5M</span></MenuItem>
                    <MenuItem value={TimeFrame.M15}><span className='toolbar-chart-item'>15M</span></MenuItem>
                    <MenuItem value={TimeFrame.M30}><span className='toolbar-chart-item'>30M</span></MenuItem>
                    <MenuItem value={TimeFrame.H}><span className='toolbar-chart-item'>1H</span></MenuItem>
                    <MenuItem value={TimeFrame.W}><span className='toolbar-chart-item'>W</span></MenuItem>
                    <MenuItem value={TimeFrame.M}>-<span className='toolbar-chart-item'>M</span></MenuItem>
                </Select>

                <IconButton
                    aria-label="Studies"
                    aria-haspopup="true"
                    aria-expanded={menuOpen ? 'true' : undefined}
                    onClick={handleMenuToggle}
                    color="inherit"
                >
                    <Typography variant="caption" sx={{ mr: 1 }}  classes={{root: 'toolbar-select'}}>
                        Studies
                    </Typography>
                    <ExpandMoreIcon />
                </IconButton>
                <Menu
                    anchorEl={anchorEl}
                    open={menuOpen}
                    onClose={() => setMenuOpen(false)}
                >
                    <MenuItem value='MOVING_AVERAGE' style={{display:'flex' , justifyContent:'space-between'}} onClick={() => setDisableMovingAverage(!disableMovingAverage)}>
                        <span>Moving Average</span>
                        <Switch checked={!disableMovingAverage}
                        onClick={() => setDisableMovingAverage(!disableMovingAverage)}
                        name="enableDisableMovingAverage"
                        color="primary"
                        />
                    </MenuItem>
                    <MenuItem value='ELDERRAY' style={{display:'flex' , justifyContent:'space-between'}} onClick={() => setDisableElderRay(!disableElderRay)}>
                        <span>Elderray</span>
                        <Switch
                            checked={!disableElderRay}
                            onClick={() => setDisableElderRay(!disableElderRay)}
                            name="enableDisableElderRay"
                            color="primary"
                        /></MenuItem>
                    <MenuItem value='MACD' style={{display:'flex' , justifyContent:'space-between'}}  onClick={() => setDisableMACD(!disableMACD)}>
                        <span>Macd</span>
                        <Switch
                            checked={!disableMACD}
                            onClick={() => setDisableMACD(!disableMACD)}
                            name="enableDisableMACD"
                            color="primary"
                        /></MenuItem>
                    <MenuItem value='BOLLINGER_BAND' style={{display:'flex' , justifyContent:'space-between'}} onClick={() => setMenuOpen(false)}>
                        <span>Bollinger Band</span>
                        <Switch
                            // checked={!isDisableMovingAverage}
                            // onClick={() => setDisableElderRay(!disableElderRay)}
                                name="enableDisableMovingAverage"
                                color="primary"
                        /></MenuItem>
                    <MenuItem value='COMPARE' style={{display:'flex' , justifyContent:'space-between'}}  onClick={() => setMenuOpen(false)}>
                        <span>Compare</span>
                        <Switch
                            // checked={!isDisableMovingAverage}
                            // onClick={() => setDisableElderRay(!disableElderRay)}
                                name="enableDisableMovingAverage"
                                color="primary"
                        /></MenuItem>
                    <MenuItem value='RSI_AND_ATR' style={{display:'flex' , justifyContent:'space-between'}} onClick={() => setMenuOpen(false)}>
                        <span>Rsi_and_Atr</span>
                        <Switch
                            // checked={!isDisableMovingAverage}
                            // onClick={() => setDisableElderRay(!disableElderRay)}
                                name="enableDisableMovingAverage"
                                color="primary"
                        /></MenuItem>
                    <MenuItem value='STOCHASTIC_OSCILLATOR' style={{display:'flex' , justifyContent:'space-between'}} onClick={() => setMenuOpen(false)}>
                        <span>Stochastic Oscillator</span>
                        <Switch
                            // checked={!isDisableMovingAverage}
                            // onClick={() => setDisableElderRay(!disableElderRay)}
                                name="enableDisableMovingAverage"
                                color="primary"
                        /></MenuItem>
                    <MenuItem value='FORCEINDEX' style={{display:'flex' , justifyContent:'space-between'}} onClick={() => setMenuOpen(false)}>
                        <span>ForceIndex</span>
                        <Switch
                            // checked={!isDisableMovingAverage}
                            // onClick={() => setDisableElderRay(!disableElderRay)}
                                name="enableDisableMovingAverage"
                                color="primary"
                        /></MenuItem>
                    <MenuItem value='ELDER_IMPULSE' style={{display:'flex' , justifyContent:'space-between'}} onClick={() => setMenuOpen(false)}>
                        <span>Elder_Impulse</span>
                        <Switch
                            // checked={!isDisableMovingAverage}
                            // onClick={() => setDisableElderRay(!disableElderRay)}
                                name="enableDisableMovingAverage"
                                color="primary"
                        /></MenuItem>
                    <MenuItem value='SAR' style={{display:'flex' , justifyContent:'space-between'}} onClick={() => setMenuOpen(false)}>
                        <span>SAR</span>
                        <Switch
                            // checked={!isDisableMovingAverage}
                            // onClick={() => setDisableElderRay(!disableElderRay)}
                                name="enableDisableMovingAverage"
                                color="primary"
                        /></MenuItem>
                    <MenuItem value='VOLUME_PROFILE' style={{display:'flex' , justifyContent:'space-between'}} onClick={() => setMenuOpen(false)}>
                        <span>Volume Profile</span>
                        <Switch
                            // checked={!isDisableMovingAverage}
                            // onClick={() => setDisableElderRay(!disableElderRay)}
                                name="enableDisableMovingAverage"
                                color="primary"
                        /></MenuItem>
                    <MenuItem value='VOLUME_PROFILE_BY_SESSION' style={{display:'flex' , justifyContent:'space-between'}} onClick={() => setMenuOpen(false)}>
                        <span>Volume profile py Session</span>
                        <Switch
                            // checked={!isDisableMovingAverage}
                            // onClick={() => setDisableElderRay(!disableElderRay)}
                                name="enableDisableMovingAverage"
                                color="primary"
                        /></MenuItem>
                </Menu>

            </div>
        </div>
    )
}

export default Toolbar;