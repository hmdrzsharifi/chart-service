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
    ListItemText,
    Autocomplete, Grid, Avatar, Menu, Checkbox
} from "@mui/material";
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
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Scrollbar from 'react-scrollbars-custom';
import {Close, Search, SmartButton} from "@mui/icons-material";
import {SymbolType} from "../type/SymbolType";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const Toolbar = (props: any) => {

    const {setSymbol} = useStore();
    const {setSeriesType} = useStore();
    const {setThemeSecondaryColor} = useDesignStore();
    const {themeMode, setThemeMode, openSideBar, setOpenSideBar} = useDesignStore();
    const [open, setOpen] = useState<boolean>(false);
    const [tabValue, setTabValue] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [options, setOptions] = useState<number[]>([]);
    const [symbolList, setSymbolList] = useState<SymbolType[]>([]);
    const {selectedSymbol , setSelectedSymbol} = useStore();
    const [menuOpen, setMenuOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<any>(null);
    const {isDisableMovingAverage,setIsDisableMovingAverage} = useStore();


    const handleMenuToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
        setMenuOpen(!menuOpen);
        setAnchorEl(event.currentTarget);
    };


    const handleOpen = () =>{
        setOpen(true)
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

    const handleCheckboxChange = () => {
        setIsDisableMovingAverage(!isDisableMovingAverage);
    };


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
                {/*sx={{ bgcolor: 'grey', '&:hover': { bgcolor: 'grey' } }}*/}
                {/*<Button variant="outlined" onClick={handleOpen} color={'primary'}>*/}
                {/*    Open Popup*/}
                {/*</Button>*/}
                <IconButton onClick={handleOpen}>
                    <Search />
                </IconButton>
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
                            <Tab label="stock" />
                        </Tabs>
                        <Scrollbar style={{ height: 300 }}>
                        {tabValue === 0 && (
                            <List>
                                {
                                    [{
                                    displaySymbol: 'Btc',
                                    description: 'main crypto coin',
                                    symbol: 'BIT',
                                }, {
                                    displaySymbol: 'Theter',
                                    description: 'main stable coin',
                                    symbol: 'TTR'
                                }]
                                //     symbolList
                                        .filter(item => item.displaySymbol.toString().toLowerCase().includes(searchTerm)).map((item) => (
                                    <ListItem className='element' key={item.symbol} onClick={(e) => sendToApp(item)} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{item.displaySymbol}</span>
                                        <span>{item.description}</span>
                                        <span>{item.symbol}</span>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                        {tabValue === 1 && (
                            <List sx={{ mt: 2 }}>
                                {
                                    [{
                                        displaySymbol: 'Btc',
                                        description: 'main crypto coin',
                                        symbol: 'BIT',
                                        type: ''
                                    }, {
                                        displaySymbol: 'Theter',
                                        description: 'main stable coin',
                                        symbol: 'TTR',
                                        type: ''
                                    }]
                                        //     symbolList
                                        .filter(item => item.displaySymbol.toString().toLowerCase().includes(searchTerm)).map((item) => (
                                        <ListItem className='element' key={item.symbol} onClick={(e) => sendToApp(item)} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>{item.displaySymbol}</span>
                                            <span>{item.description}</span>
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
                <IconButton
                    aria-label="Studies"
                    aria-haspopup="true"
                    aria-expanded={menuOpen ? 'true' : undefined}
                    onClick={handleMenuToggle}
                    color="inherit"
                >
                    <Typography variant="button" sx={{ mr: 1 }}  classes={{root: 'toolbar-select'}}>
                        Studies
                    </Typography>
                    <ExpandMoreIcon />
                </IconButton>
                <Menu
                    anchorEl={anchorEl}
                    open={menuOpen}
                    onClose={() => setMenuOpen(false)}
                >
                    <MenuItem value='MOVING_AVERAGE' onClick={() => setIsDisableMovingAverage(!isDisableMovingAverage)}>
                        Moving Average
                        <Checkbox
                            checked={!isDisableMovingAverage}
                            onChange={handleCheckboxChange}
                            name="enableDisableMovingAverage"
                            color="primary"
                        />
                    </MenuItem>
                    <MenuItem value='BOLLINGER_BAND' onClick={() => setMenuOpen(false)}>
                        Bollinger Band
                        <Checkbox
                            // checked={!isDisableMovingAverage}
                            onChange={handleCheckboxChange}
                            name="enableDisableMovingAverage"
                            color="primary"
                        /></MenuItem>
                    <MenuItem value='COMPARE' onClick={() => setMenuOpen(false)}>
                        Compare
                        <Checkbox
                            // checked={!isDisableMovingAverage}
                            onChange={handleCheckboxChange}
                            name="enableDisableMovingAverage"
                            color="primary"
                        /></MenuItem>
                    <MenuItem value='MACD' onClick={() => setMenuOpen(false)}>
                        Macd
                        <Checkbox
                            // checked={!isDisableMovingAverage}
                            onChange={handleCheckboxChange}
                            name="enableDisableMovingAverage"
                            color="primary"
                        /></MenuItem>
                    <MenuItem value='RSI_AND_ATR' onClick={() => setMenuOpen(false)}>
                        Rsi_and_Atr
                        <Checkbox
                            // checked={!isDisableMovingAverage}
                            onChange={handleCheckboxChange}
                            name="enableDisableMovingAverage"
                            color="primary"
                        /></MenuItem>
                    <MenuItem value='STOCHASTIC_OSCILLATOR' onClick={() => setMenuOpen(false)}>
                        Stochastic Oscillator
                        <Checkbox
                            // checked={!isDisableMovingAverage}
                            onChange={handleCheckboxChange}
                            name="enableDisableMovingAverage"
                            color="primary"
                        /></MenuItem>
                    <MenuItem value='FORCEINDEX' onClick={() => setMenuOpen(false)}>
                        ForceIndex
                        <Checkbox
                            // checked={!isDisableMovingAverage}
                            onChange={handleCheckboxChange}
                            name="enableDisableMovingAverage"
                            color="primary"
                        /></MenuItem>
                    <MenuItem value='ELDERRAY' onClick={() => setMenuOpen(false)}>
                        Elderray
                        <Checkbox
                            // checked={!isDisableMovingAverage}
                            onChange={handleCheckboxChange}
                            name="enableDisableMovingAverage"
                            color="primary"
                        /></MenuItem>
                    <MenuItem value='ELDER_IMPULSE' onClick={() => setMenuOpen(false)}>
                        Elder_Impulse
                        <Checkbox
                            // checked={!isDisableMovingAverage}
                            onChange={handleCheckboxChange}
                            name="enableDisableMovingAverage"
                            color="primary"
                        /></MenuItem>
                    <MenuItem value='SAR' onClick={() => setMenuOpen(false)}>
                        SAR
                        <Checkbox
                            // checked={!isDisableMovingAverage}
                            onChange={handleCheckboxChange}
                            name="enableDisableMovingAverage"
                            color="primary"
                        /></MenuItem>
                    <MenuItem value='VOLUME_PROFILE' onClick={() => setMenuOpen(false)}>
                        Volume Profile
                        <Checkbox
                            // checked={!isDisableMovingAverage}
                            onChange={handleCheckboxChange}
                            name="enableDisableMovingAverage"
                            color="primary"
                        /></MenuItem>
                    <MenuItem value='VOLUME_PROFILE_BY_SESSION' onClick={() => setMenuOpen(false)}>
                        Volume profile py Session
                        <Checkbox
                            // checked={!isDisableMovingAverage}
                            onChange={handleCheckboxChange}
                            name="enableDisableMovingAverage"
                            color="primary"
                        /></MenuItem>
                </Menu>

            </div>
        </div>
    )
}

export default Toolbar;