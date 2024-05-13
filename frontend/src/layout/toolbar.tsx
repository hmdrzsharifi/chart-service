import React, {useState} from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import useStore from "../util/store";
import {
    Autocomplete,
    CircularProgress,
    IconButton,
    List,
    ListItem,
    Menu,
    Switch,
    Tab,
    Tabs,
    TextField,
    ToggleButton,
    Tooltip
} from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
import {Add, CameraEnhance, Close, Message, Search} from "@mui/icons-material";
import {SymbolList} from "../type/SymbolType";
import {fetchCexSymbols} from "../util/utils";
import html2canvas from 'html2canvas';

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
    const {selectedSymbol, setSelectedSymbol} = useStore();
    const [menuOpen, setMenuOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<any>(null);
    const {disableMovingAverage, setDisableMovingAverage} = useStore();
    const {disableVolume, setDisableVolume} = useStore();
    const {disableElderRay, setDisableElderRay} = useStore();
    const {disableSAR , setDisableSAR} = useStore();
    const {disableRSIAndATR , setDisableRSIAndATR} = useStore();
    const {disableForceIndex , setDisableForceIndex} = useStore();
    const {disableStochasticOscillator , setDisableStochasticOscillator} = useStore();
    const {timeFrame, setTimeFrame} = useStore();
    const {disableHoverTooltip, setDisableHoverTooltip} = useStore();
    const {disableCrossHair, setDisableCrossHair} = useStore();
    const {disableMACD, setDisableMACD} = useStore();
    const [loading, setLoading] = useState(false);


    const handleMenuToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
        setMenuOpen(!menuOpen);
        setAnchorEl(event.currentTarget);
    };

    const handleOpen = async () => {
        setOpen(true)
        setLoading(true);
        try {
            const symboleData = await fetchCexSymbols()
            setSymbolList(symboleData)
        } catch (error) {
            console.error('Error fetching symbols:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setTabValue(0);
        setSearchTerm('');
    }
    const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
        console.log({newValue})
        setTabValue(newValue)
    };
    const handleSearch = (event: React.ChangeEvent<{}>, value: string) => {
        console.log({event})
        console.log({value})
        setSearchTerm(value);
    };

    const sendToApp = async (item: any) => {
        console.log({item})
        let selectedText = '';
        var name = item.symbol;
        if (item.categoryName === 'CRT') {
            name = name.replace('_USD', 'USDT');
            selectedText = `BINANCE:${name}`;
        }
        if(item.categoryName == "FX"){
            name = `OANDA:${name}`;
        }
        if(item.categoryName == "STC"){
            name = `${name}`;
            selectedText = name
        }
        if(item.categoryName == "ETF"){
            name = `${name}`;
            selectedText = name
        }
        if(item.categoryName == "CMD"){
            name = `OANDA:${name}`;
            selectedText = name
        }
        if(item.categoryName == "IND"){
            name = `OANDA:${name}`;
            selectedText = name
        }
        console.log({selectedText})
        setSymbol(selectedText)
        setSelectedSymbol(item.symbol)
        handleClose()
    }

    const captureScreenshot = () => {
        const element = document.getElementById("chartId");
        const elementToolbar = document.getElementById("toolbarId");
        const yOffset = elementToolbar ? elementToolbar.offsetHeight - 40 : 0;
        const width = document.body.scrollWidth;
        const height = element ? element.offsetHeight - yOffset : 0;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        if(element) {
            html2canvas(element, {
                canvas: canvas,
                y: yOffset,
                height: height
            }).then(canvas => {
                const image = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.href = image;
                downloadLink.download = 'screenshot.png';
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            });
        }
    };

    return (
        <div className="toolbar" style={props.style} id={"toolbarId"}>

            <div className="toolbar-left-box">
                <Tooltip title="Draw" placement="bottom" arrow>
                    <IconButton
                        sx={{padding: '5px'}}
                        onClick={() => setOpenSideBar(!openSideBar)}
                    >
                        <EditNoteIcon sx={{width: 30, height: 30}}/>
                    </IconButton>
                </Tooltip>
                <Tooltip title="Screenshot" placement="bottom" arrow>
                    <IconButton onClick={captureScreenshot}>
                        <CameraEnhance/>
                    </IconButton>
                </Tooltip>
                <Tooltip title="Crosshair" placement="bottom" arrow>
                    <ToggleButton value="left" size="small" aria-label="Small sizes" selected={disableCrossHair}
                                  className="small-toggle-button"
                                  onChange={() => {
                                      setDisableCrossHair(!disableCrossHair);
                                  }}>
                        <Add/>
                    </ToggleButton>
                </Tooltip>
                <Tooltip title="Info" placement="bottom" arrow>
                    <ToggleButton value="left" size="small" aria-label="Small sizes" selected={disableHoverTooltip}
                                  className="small-toggle-button"
                                  onChange={() => {
                                      setDisableHoverTooltip(!disableHoverTooltip);
                                  }}>
                        <Message/>
                    </ToggleButton>
                </Tooltip>
                <Tooltip title="Search Symbol" placement="bottom" arrow>
                    <IconButton onClick={handleOpen}>
                        <Search/>
                    </IconButton>
                </Tooltip>
                <span onClick={handleOpen} style={{cursor: 'pointer', fontWeight: 'bolder'}}>
                {selectedSymbol}
                </span>
                <Modal
                    open={open}
                    onClose={handleClose}
                    sx={{maxHeight: '95%'}}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    {loading ? (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: '100vh'
                        }}>
                            <CircularProgress/>
                            <p>Loading...</p>
                        </div>
                    ) : (
                        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', maxWidth: 600, maxHeight: '80%', bgcolor: 'background.paper', boxShadow: 24, p: 4 ,
                            border: '2px solid #000',
                            borderRadius: '8px'}}>

                        <Typography id="modal-modal-title" variant="h6" component="h2">
                                Select Symbol
                            </Typography>
                            <IconButton aria-label='close' onClick={handleClose}
                                        style={{position: 'absolute', top: '10px', right: '10px'}}>
                                <Close/>
                            </IconButton>
                            <Autocomplete
                                freeSolo
                                options={options}
                                renderInput={(params) => <TextField {...params} label="Search" variant="outlined"/>}
                                onInputChange={(event, value) => handleSearch(event, value)}
                            />
                            <Tabs value={tabValue} onChange={handleChangeTab} sx={{mt: 2}} variant="scrollable"
                                  scrollButtons="auto">
                                <Tab label="ALL"/>
                                <Tab label="CRYPTO"/>
                                <Tab label="FX"/>
                                <Tab label="ETF"/>
                                <Tab label="CMD"/>
                                <Tab label="CRT"/>
                                <Tab label="IND"/>
                                <Tab label="STC"/>
                                <Tab label="FUND"/>
                            </Tabs>
                            <Scrollbar style={{height: 300}}>
                                {tabValue === 0 && (
                                    <List>
                                        {symbolList.filter((item: SymbolList) => item.symbol.toString().toLowerCase().includes(searchTerm)).map((item: SymbolList) => (
                                            <ListItem className='element' key={item.symbol} onClick={(e) => sendToApp(item)} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    {item.icon && <img src={item.icon} alt="icon" style={{ marginRight: '8px', width: '24px', height: '24px' }} />}
                                                    <span>{item.categoryName}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <span>{item.symbol}</span>
                                                </div>
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                                {tabValue === 1 && (
                                    <List sx={{mt: 2}}>
                                        {symbolList.filter((item: SymbolList) => item.categoryName.startsWith('CRT') && item.symbol.toString().toLowerCase().includes(searchTerm)).map((item: SymbolList) => (
                                            <ListItem className='element' key={item.symbol}
                                                      onClick={(e) => sendToApp(item)}
                                                      style={{display: 'flex', justifyContent: 'space-between'}}>
                                                <div style={{display: 'flex', alignItems: 'center'}}>
                                                    {item.icon && <img src={item.icon} alt="icon" style={{
                                                        marginRight: '8px',
                                                        width: '24px',
                                                        height: '24px'
                                                    }}/>}
                                                    <span>{item.categoryName}</span>
                                                </div>
                                                <div style={{display: 'flex', alignItems: 'center'}}>
                                                    <span>{item.symbol}</span>
                                                </div>
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                                {tabValue === 2 && (
                                    <List sx={{mt: 2}}>
                                        {symbolList.filter((item: SymbolList) => item.categoryName.startsWith('FX') && item.symbol.toString().toLowerCase().includes(searchTerm)).map((item: SymbolList) => (
                                            <ListItem className='element' key={item.symbol}
                                                      onClick={(e) => sendToApp(item)}
                                                      style={{display: 'flex', justifyContent: 'space-between'}}>
                                                <div style={{display: 'flex', alignItems: 'center'}}>
                                                    {item.icon && <img src={item.icon} alt="icon" style={{
                                                        marginRight: '8px',
                                                        width: '24px',
                                                        height: '24px'
                                                    }}/>}
                                                    <span>{item.categoryName}</span>
                                                </div>
                                                <div style={{display: 'flex', alignItems: 'center'}}>
                                                    <span>{item.symbol}</span>
                                                </div>
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                                {tabValue === 3 && (
                                    <List sx={{mt: 2}}>
                                        {symbolList.filter((item: SymbolList) => item.categoryName.startsWith('ETF') && item.symbol.toString().toLowerCase().includes(searchTerm)).map((item: SymbolList) => (
                                            <ListItem className='element' key={item.symbol}
                                                      onClick={(e) => sendToApp(item)}
                                                      style={{display: 'flex', justifyContent: 'space-between'}}>
                                                <div style={{display: 'flex', alignItems: 'center'}}>
                                                    {item.icon && <img src={item.icon} alt="icon" style={{
                                                        marginRight: '8px',
                                                        width: '24px',
                                                        height: '24px'
                                                    }}/>}
                                                    <span>{item.categoryName}</span>
                                                </div>
                                                <div style={{display: 'flex', alignItems: 'center'}}>
                                                    <span>{item.symbol}</span>
                                                </div>
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                                {tabValue === 4 && (
                                    <List sx={{mt: 2}}>
                                        {symbolList.filter((item: SymbolList) => item.categoryName.startsWith('CMD') && item.symbol.toString().toLowerCase().includes(searchTerm)).map((item: SymbolList) => (
                                            <ListItem className='element' key={item.symbol}
                                                      onClick={(e) => sendToApp(item)}
                                                      style={{display: 'flex', justifyContent: 'space-between'}}>
                                                <div style={{display: 'flex', alignItems: 'center'}}>
                                                    {item.icon && <img src={item.icon} alt="icon" style={{
                                                        marginRight: '8px',
                                                        width: '24px',
                                                        height: '24px'
                                                    }}/>}
                                                    <span>{item.categoryName}</span>
                                                </div>
                                                <div style={{display: 'flex', alignItems: 'center'}}>
                                                    <span>{item.symbol}</span>
                                                </div>
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                                {tabValue === 5 && (
                                    <List sx={{mt: 2}}>
                                        {symbolList.filter((item: SymbolList) => item.categoryName.startsWith('CRT') && item.symbol.toString().toLowerCase().includes(searchTerm)).map((item: SymbolList) => (
                                            <ListItem className='element' key={item.symbol}
                                                      onClick={(e) => sendToApp(item)}
                                                      style={{display: 'flex', justifyContent: 'space-between'}}>
                                                <div style={{display: 'flex', alignItems: 'center'}}>
                                                    {item.icon && <img src={item.icon} alt="icon" style={{
                                                        marginRight: '8px',
                                                        width: '24px',
                                                        height: '24px'
                                                    }}/>}
                                                    <span>{item.categoryName}</span>
                                                </div>
                                                <div style={{display: 'flex', alignItems: 'center'}}>
                                                    <span>{item.symbol}</span>
                                                </div>
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                                {tabValue === 6 && (
                                    <List sx={{mt: 2}}>
                                        {symbolList.filter((item: SymbolList) => item.categoryName.startsWith('IND') && item.symbol.toString().toLowerCase().includes(searchTerm)).map((item: SymbolList) => (
                                            <ListItem className='element' key={item.symbol}
                                                      onClick={(e) => sendToApp(item)}
                                                      style={{display: 'flex', justifyContent: 'space-between'}}>
                                                <div style={{display: 'flex', alignItems: 'center'}}>
                                                    {item.icon && <img src={item.icon} alt="icon" style={{
                                                        marginRight: '8px',
                                                        width: '24px',
                                                        height: '24px'
                                                    }}/>}
                                                    <span>{item.categoryName}</span>
                                                </div>
                                                <div style={{display: 'flex', alignItems: 'center'}}>
                                                    <span>{item.symbol}</span>
                                                </div>
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                                {tabValue === 7 && (
                                    <List sx={{mt: 2}}>
                                        {symbolList.filter((item: SymbolList) => item.categoryName.startsWith('STC') && item.symbol.toString().toLowerCase().includes(searchTerm)).map((item: SymbolList) => (
                                            <ListItem className='element' key={item.symbol}
                                                      onClick={(e) => sendToApp(item)}
                                                      style={{display: 'flex', justifyContent: 'space-between'}}>
                                                <div style={{display: 'flex', alignItems: 'center'}}>
                                                    {item.icon && <img src={item.icon} alt="icon" style={{
                                                        marginRight: '8px',
                                                        width: '24px',
                                                        height: '24px'
                                                    }}/>}
                                                    <span>{item.categoryName}</span>
                                                </div>
                                                <div style={{display: 'flex', alignItems: 'center'}}>
                                                    <span>{item.symbol}</span>
                                                </div>
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                                {tabValue === 8 && (
                                    <List sx={{mt: 2}}>
                                        {symbolList.filter((item: SymbolList) => item.categoryName.startsWith('Fund') && item.symbol.toString().toLowerCase().includes(searchTerm)).map((item: SymbolList) => (
                                            <ListItem className='element' key={item.symbol}
                                                      onClick={(e) => sendToApp(item)}
                                                      style={{display: 'flex', justifyContent: 'space-between'}}>
                                                <div style={{display: 'flex', alignItems: 'center'}}>
                                                    {item.icon && <img src={item.icon} alt="icon" style={{
                                                        marginRight: '8px',
                                                        width: '24px',
                                                        height: '24px'
                                                    }}/>}
                                                    <span>{item.categoryName}</span>
                                                </div>
                                                <div style={{display: 'flex', alignItems: 'center'}}>
                                                    <span>{item.symbol}</span>
                                                </div>
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                            </Scrollbar>
                            <Button onClick={handleClose} color='error' sx={{
                                alignSelf: 'flex-end', // قرار دادن دکمه "بستن" در انتهای باکس
                            }}
                            >Close</Button>
                        </Box>
                    )}
                </Modal>
            </div>
            <div className="toolbar-right-box">
                <Switch onChange={() => {
                    setThemeSecondaryColor(themeMode === 'dark' ? '#000' : '#fff')
                    setThemeMode(themeMode === 'dark' ? 'light' : 'dark')
                }
                }
                        icon={<LightModeIcon/>}
                        checkedIcon={<DarkModeIcon/>}
                        classes={{root: 'change-theme-switch', checked: 'change-theme-switch-checked'}}
                />

                {/*<Select*/}
                {/*    labelId="demo-select-small-label"*/}
                {/*    defaultValue='BTC_USD'*/}
                {/*    classes={{root: 'toolbar-select'}}*/}
                {/*    IconComponent={ExpandMore}*/}
                {/*    // @ts-ignore*/}
                {/*    onChange={(event) => setSymbol(event?.target?.value)}*/}
                {/*>*/}
                {/*    /!*<MenuItem value='AAPL'>Apple</MenuItem>*!/*/}
                {/*    /!*<MenuItem value='BINANCE:BTCUSDT'>Bitcoin</MenuItem>*!/*/}
                {/*    <MenuItem value='BTC_USD'>Bitcoin</MenuItem>*/}
                {/*    /!*<MenuItem value='AMZN'>Amazon</MenuItem>*!/*/}
                {/*</Select>*/}

                <Select
                    labelId="demo-select-small-label"
                    defaultValue={Series.CANDLE}
                    classes={{root: 'toolbar-select', select: 'toolbar-chart-icon'}}
                    IconComponent={ExpandMore}
                    // @ts-ignore
                    onChange={(event) => setSeriesType(event?.target?.value)}
                >
                    <MenuItem value={Series.CANDLE}><CandleIcon/> <span
                        className='toolbar-chart-item'>Candle</span></MenuItem>
                    <MenuItem value={Series.BAR}><BarIcon/> <span className='toolbar-chart-item'>Bar</span></MenuItem>
                    <MenuItem value={Series.LINE}><LineIcon/> <span
                        className='toolbar-chart-item'>Line</span></MenuItem>
                    <MenuItem value={Series.AREA}><AreaIcon/> <span
                        className='toolbar-chart-item'>Area</span></MenuItem>
                    <MenuItem value={Series.BASE_LINE}><BaseLineIcon/> <span
                        className='toolbar-chart-item'>Base Line</span></MenuItem>
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
                    <Typography variant="caption" sx={{mr: 1}} classes={{root: 'toolbar-select'}}>
                        Studies
                    </Typography>
                    <ExpandMoreIcon/>
                </IconButton>
                <Menu
                    anchorEl={anchorEl}
                    open={menuOpen}
                    onClose={() => setMenuOpen(false)}
                >
                    <MenuItem value='MOVING_AVERAGE' style={{display: 'flex', justifyContent: 'space-between'}}
                              onClick={() => setDisableMovingAverage(!disableMovingAverage)}>
                        <span>Moving Average</span>
                        <Switch checked={!disableMovingAverage}
                                onClick={() => setDisableMovingAverage(!disableMovingAverage)}
                                name="enableDisableMovingAverage"
                                color="primary"
                        />
                    </MenuItem>
                    <MenuItem value='VOLUME' style={{display: 'flex', justifyContent: 'space-between'}}
                              onClick={() => setDisableVolume(!disableVolume)}>
                        <span>Volume</span>
                        <Switch checked={!disableVolume}
                                onClick={() => setDisableVolume(!disableVolume)}
                                name="enableDisableVolume"
                                color="primary"
                        />
                    </MenuItem>
                    <MenuItem value='ELDERRAY' style={{display: 'flex', justifyContent: 'space-between'}}
                              onClick={() => setDisableElderRay(!disableElderRay)}>
                        <span>Elderray</span>
                        <Switch
                            checked={!disableElderRay}
                            onClick={() => setDisableElderRay(!disableElderRay)}
                            name="enableDisableElderRay"
                            color="primary"
                        /></MenuItem>
                    <MenuItem value='MACD' style={{display: 'flex', justifyContent: 'space-between'}}
                              onClick={() => setDisableMACD(!disableMACD)}>
                        <span>Macd</span>
                        <Switch
                            checked={!disableMACD}
                            onClick={() => setDisableMACD(!disableMACD)}
                            name="enableDisableMACD"
                            color="primary"
                        /></MenuItem>
                    <MenuItem value='SAR' style={{display: 'flex', justifyContent: 'space-between'}}
                              onClick={() => setDisableSAR(!disableSAR)}>
                        <span>SAR</span>
                        <Switch
                            checked={!disableSAR}
                            onClick={() => setDisableSAR(!disableSAR)}
                            name="enableDisableSAR"
                            color="primary"
                        /></MenuItem>
                    <MenuItem value='RSI_AND_ATR' style={{display: 'flex', justifyContent: 'space-between'}}
                              onClick={() => setDisableRSIAndATR(!disableRSIAndATR)}>
                        <span>Rsi_and_Atr</span>
                        <Switch
                            checked={!disableRSIAndATR}
                            onClick={() => setDisableRSIAndATR(!disableRSIAndATR)}
                            name="enableDisableRSIAndATR"
                            color="primary"
                        /></MenuItem>
                    <MenuItem value='FORCEINDEX' style={{display: 'flex', justifyContent: 'space-between'}}
                              onClick={() => setDisableForceIndex(!disableForceIndex)}>
                        <span>ForceIndex</span>
                        <Switch
                            checked={!disableForceIndex}
                            onClick={() => setDisableForceIndex(!disableForceIndex)}
                            name="enableDisableForceIndex"
                            color="primary"
                        /></MenuItem>
                    <MenuItem value='STOCHASTIC_OSCILLATOR' style={{display: 'flex', justifyContent: 'space-between'}}
                              onClick={() => setDisableStochasticOscillator(!disableStochasticOscillator)}>
                        <span>Stochastic Oscillator</span>
                        <Switch
                            checked={!disableStochasticOscillator}
                            onClick={() => setDisableStochasticOscillator(!disableStochasticOscillator)}
                            name="enableDisableStochasticOscillator"
                            color="primary"
                        /></MenuItem>
                    <MenuItem value='BOLLINGER_BAND' style={{display: 'flex', justifyContent: 'space-between'}}
                              onClick={() => setMenuOpen(false)}>
                        <span>Bollinger Band</span>
                        <Switch
                            // checked={!isDisableMovingAverage}
                            // onClick={() => setDisableElderRay(!disableElderRay)}
                            name="enableDisableMovingAverage"
                            color="primary"
                        /></MenuItem>
                    <MenuItem value='COMPARE' style={{display: 'flex', justifyContent: 'space-between'}}
                              onClick={() => setMenuOpen(false)}>
                        <span>Compare</span>
                        <Switch
                            // checked={!isDisableMovingAverage}
                            // onClick={() => setDisableElderRay(!disableElderRay)}
                            name="enableDisableMovingAverage"
                            color="primary"
                        /></MenuItem>
                    <MenuItem value='ELDER_IMPULSE' style={{display: 'flex', justifyContent: 'space-between'}}
                              onClick={() => setMenuOpen(false)}>
                        <span>Elder_Impulse</span>
                        <Switch
                            // checked={!isDisableMovingAverage}
                            // onClick={() => setDisableElderRay(!disableElderRay)}
                            name="enableDisableMovingAverage"
                            color="primary"
                        /></MenuItem>
                    <MenuItem value='VOLUME_PROFILE' style={{display: 'flex', justifyContent: 'space-between'}}
                              onClick={() => setMenuOpen(false)}>
                        <span>Volume Profile</span>
                        <Switch
                            // checked={!isDisableMovingAverage}
                            // onClick={() => setDisableElderRay(!disableElderRay)}
                            name="enableDisableMovingAverage"
                            color="primary"
                        /></MenuItem>
                    <MenuItem value='VOLUME_PROFILE_BY_SESSION'
                              style={{display: 'flex', justifyContent: 'space-between'}}
                              onClick={() => setMenuOpen(false)}>
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