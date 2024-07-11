import React, {ChangeEvent, useState} from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import useStore from "../util/store";
import {
    Autocomplete,
    CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
    IconButton, InputAdornment,
    List,
    ListItem, ListItemText,
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
import {Series, StudiesChart, TimeFrame} from "../type/Enum";
import BaseLineIcon from "../icons/BaseLineIcon";
import AreaIcon from "../icons/AreaIcon";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Scrollbar from 'react-scrollbars-custom';
import {Add, CameraEnhance, Close, CloudDownload, Message, RefreshTwoTone, Save, Search} from "@mui/icons-material";
import {SymbolList} from "../type/SymbolType";
import {fetchCexSymbols} from "../util/utils";
import html2canvas from 'html2canvas';
import getDesignTokens from "../config/theme";
import {MainChart} from "../chart/MainChart";

const Toolbar = (props: any) => {

    const {symbol , setSymbol} = useStore();
    const {symbolCategory , setSymbolCategory} = useStore();
    const {seriesType , setSeriesType} = useStore();
    const {setThemeSecondaryColor} = useDesignStore();
    const [checkedThemeSwitch , setCheckedThemeSwitch] = useState<boolean>(true);
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
    const {disableVolume, setDisableVolume} = useStore();
    const {studiesCharts, setStudiesCharts} = useStore();
    const {studiesChartsWithTooltip, setStudiesChartsWithTooltip} = useStore();
    const {timeFrame, setTimeFrame} = useStore();
    const {disableHoverTooltip, setDisableHoverTooltip} = useStore();
    const {disableCrossHair, setDisableCrossHair} = useStore();
    const {setError} = useStore();
    const {setFixedPosition} = useStore()
    const {equidistantChannels , setEquidistantChannels} = useStore()
    const {trends , setTrends} = useStore()
    const {retracements , setRetracements} = useStore()
    const {standardDeviationChannel , setStandardDeviationChannel} = useStore()
    const {fans , setFans} = useStore()
    const {xExtents , setXExtents} = useStore()
    const [isOpenSave, setIsOpenSave] = useState(false);
    const [localStorageItems, setLocalStorageItems] = useState<string[]>([]);
    const {chartDimensions} = useStore()
    // const {disableMACD, setDisableMACD} = useStore();
    const [loading, setLoading] = useState(false);
    const {saveMenuOpen, setSaveMenuOpen} = useStore()
    const [saveAnchorEl, setSaveAnchorEl] = useState<any>(null);
    const [saveName, setSaveName] = useState('');
    const {openSaveDialog, setOpenSaveDialog}= useStore();
    const {suffix, setSuffix}= useStore();
    const [saveSearchTerm, setSAveSearchTerm] = useState('');

    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSAveSearchTerm(event.target.value);
    };

    const filteredItems = localStorageItems.filter((item) =>
        item.toLowerCase().includes(saveSearchTerm.toLowerCase())
    );


    const openSaveModal = () => {
        const items: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('chart_')) {
                items.push(key);
            }
        }
        setLocalStorageItems(items);
        setIsOpenSave(true);
    };

    const closeSaveModal = () => {
        setIsOpenSave(false);
    };

    const closeSaveDialog = () => {
        setOpenSaveDialog(false);
    };

    const handleSave = () => {
        console.log({saveName})
        const chartState = {
            trends,
            retracements,
            equidistantChannels,
            standardDeviationChannel,
            fans,
            studiesCharts,
            xExtents,
            symbol,
            selectedSymbol,
            seriesType,
            timeFrame,
            themeMode,
            checkedThemeSwitch
        }
        const prefixedSaveName = `chart_${saveName}`;
        localStorage.setItem(prefixedSaveName , JSON.stringify(chartState));
        closeSaveDialog();
    };

    const handleCancel = () => {
        setSaveName('');
        closeSaveDialog();
    };


    const handleMenuToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
        setMenuOpen(!menuOpen);
        setAnchorEl(event.currentTarget);
    };

    const handleSaveMenuToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
        setSaveMenuOpen(!saveMenuOpen);
        setSaveAnchorEl(event.currentTarget);
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
        setTabValue(newValue)
    };

    const handleItemClick = (item: string) => {
        const savedState: any = localStorage.getItem(item)
        if (savedState) {
            const chartState: any = JSON.parse(savedState)
            setTrends(chartState.trends || [])
            setRetracements(chartState.retracements || [])
            setEquidistantChannels(chartState.equidistantChannels || [])
            setStandardDeviationChannel(chartState.standardDeviationChannel || [])
            setFans(chartState.fans || [])
            setStudiesCharts(chartState.studiesCharts || [])
            setXExtents(chartState.xExtents)
            setSymbol(chartState.symbol)
            setSelectedSymbol(chartState.selectedSymbol)
            setSeriesType(chartState.seriesType)
            setTimeFrame(chartState.timeFrame)
            setThemeMode(chartState.themeMode)
            setCheckedThemeSwitch(chartState.checkedThemeSwitch)
        }
        setSaveName(item.replace('chart_', ''))
        closeSaveModal()
        setSaveMenuOpen(false)
    }
    const handleSearch = (event: React.ChangeEvent<{}>, value: string) => {
        // console.log({event})
        // console.log({value})
        setSearchTerm(value);
    };

    const sendToApp = async (item: any) => {
        console.log({item})
        let selectedText = '';
        var name = item.symbol;
        if (item.categoryName === 'CRT') {
            // name = name.replace('_USD', 'USD');
            selectedText = name;
        }
        if (item.categoryName === "FX") {
            name = `${name}`;
            selectedText = name;
        }
        if (item.categoryName === "STC") {
            name = `${name}`;
            selectedText = name
        }
        if (item.categoryName === "ETF") {
            name = `${name}`;
            selectedText = name
        }
        if (item.categoryName === "CMD") {
            // name = `OANDA:${name}`;
            selectedText = name
        }
        if (item.categoryName === "IND") {
            // name = `OANDA:${name}`;
            selectedText = name
        }

        setSymbolCategory(item?.categoryName)
        setSymbol(selectedText)
        setSelectedSymbol(item.symbol)
        setError(false)
        handleClose()
    }

    const captureScreenshot = () => {
        const element = document.getElementById("chartId");

        const canvas = document.createElement('canvas');
        canvas.width = chartDimensions.width;
        canvas.height = chartDimensions.height;

        if (element) {
            html2canvas(element, {
                canvas: canvas,
                scale: 1,
            }).then(canvas => {
                const image = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.href = image;
                downloadLink.download = `chart-${selectedSymbol}.jpg`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            });
        }
    };

    const handleChangeStudiesChart = (chart: StudiesChart) => {
        setStudiesCharts(
            studiesCharts.includes(chart) ? studiesCharts.filter(item => item !== chart) : [chart, ...studiesCharts]
        )
    }

    const handleChangeStudiesChartWithTooltip = (chart: StudiesChart) => {
        setStudiesChartsWithTooltip(
            studiesChartsWithTooltip.includes(chart) ? studiesChartsWithTooltip.filter(item => item !== chart) : [...studiesChartsWithTooltip, chart]
        )
    }

    const isStudiesChartInclude = (chart: StudiesChart): boolean => {
        return studiesCharts.includes(chart)
    }

    const isStudiesChartWithTooltipInclude = (chart: StudiesChart): boolean => {
        return studiesChartsWithTooltip.includes(chart)
    }

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
                <Tooltip title="Refresh chart" placement="bottom" arrow>
                    <IconButton onClick={() => {
                        props.fetchInitialData()
                        setFixedPosition(false)
                        setSuffix(suffix + 1)
                        setError(false)
                    }}>
                        <RefreshTwoTone/>
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
                <Tooltip title="Symbol Search" placement="bottom" arrow>
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
                    // aria-labelledby="modal-modal-title"
                    // aria-describedby="modal-modal-description"
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
                        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', maxWidth: 600, maxHeight: '80%', bgcolor: getDesignTokens(themeMode).palette.chartBackground, boxShadow: 24, p: 4 ,
                            border: '2px solid #000',
                            borderRadius: '8px'}}>

                        <Typography id="modal-modal-title" variant="h6" component="h2">
                            Symbol Search
                            </Typography>
                            <IconButton aria-label='close' onClick={handleClose}
                                        style={{position: 'absolute', top: '10px', right: '10px'}}>
                                <Close/>
                            </IconButton>
                            <Autocomplete
                                freeSolo
                                style={{marginTop: '16px'}}
                                options={options}
                                renderInput={(params) => <TextField
                                    {...params}
                                    autoFocus={true}
                                    label="Search"
                                    variant="outlined"
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search/>
                                            </InputAdornment>
                                        ),
                                    }}
                                />}
                                onInputChange={(event, value) => handleSearch(event, value)}
                            />
                            <Tabs value={tabValue} onChange={handleChangeTab} sx={{mt: 2}} variant="scrollable"
                                  scrollButtons="auto">
                                <Tab label="ALL"/>
                                <Tab label="CRYPTO"/>
                                <Tab label="STC"/>
                                <Tab label="FX"/>
                                <Tab label="ETF"/>
                                <Tab label="CMD"/>
                                <Tab label="IND"/>
                                <Tab label="FUND"/>
                            </Tabs>
                            <Scrollbar style={{height: 300}}>
                                {tabValue === 0 && (
                                    <List>
                                        {symbolList.filter((item: SymbolList) => item.symbol.toString().toLowerCase().includes(searchTerm)).sort((a: SymbolList, b: SymbolList) => a.categoryName.localeCompare(b.categoryName))
                                            .map((item: SymbolList) => (
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
                                {tabValue === 3 && (
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
                                {tabValue === 4 && (
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
                                {tabValue === 5 && (
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
                        </Box>
                    )}
                </Modal>
            </div>
            <div className="toolbar-right-box">
                <Switch checked={checkedThemeSwitch} onChange={() => {
                    setThemeSecondaryColor(themeMode === 'dark' ? '#000' : '#fff')
                    setThemeMode(themeMode === 'dark' ? 'light' : 'dark')
                    setCheckedThemeSwitch(!checkedThemeSwitch)
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
                    onChange={(event) => {
                        setTimeFrame(event?.target?.value as TimeFrame);
                        setError(false);
                    }}
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
                              onClick={() => handleChangeStudiesChartWithTooltip(StudiesChart.MOVING_AVERAGE)}>
                        <span>Moving Average</span>
                        <Switch checked={isStudiesChartWithTooltipInclude(StudiesChart.MOVING_AVERAGE)}
                                onClick={() => handleChangeStudiesChartWithTooltip(StudiesChart.MOVING_AVERAGE)}
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
                              onClick={() => handleChangeStudiesChart(StudiesChart.ELDER_RAY)}
                    >
                        <span>ElderRay</span>
                        <Switch
                            checked={isStudiesChartInclude(StudiesChart.ELDER_RAY)}
                            onClick={() => handleChangeStudiesChart(StudiesChart.ELDER_RAY)}
                            name="enableDisableElderRay"
                            color="primary"
                        /></MenuItem>
                    <MenuItem value='MACD' style={{display: 'flex', justifyContent: 'space-between'}}
                              onClick={() => handleChangeStudiesChart(StudiesChart.MACD)}>
                        <span>MACD</span>
                        <Switch
                            checked={isStudiesChartInclude(StudiesChart.MACD)}
                            onClick={() => handleChangeStudiesChart(StudiesChart.MACD)}
                            name="enableDisableMACD"
                            color="primary"
                        /></MenuItem>
                    <MenuItem value='SAR' style={{display: 'flex', justifyContent: 'space-between'}}
                              onClick={() => handleChangeStudiesChartWithTooltip(StudiesChart.SAR)}>
                        <span>SAR</span>
                        <Switch
                            checked={isStudiesChartWithTooltipInclude(StudiesChart.SAR)}
                            onClick={() => handleChangeStudiesChartWithTooltip(StudiesChart.SAR)}
                            name="enableDisableSAR"
                            color="primary"
                        /></MenuItem>
                    <MenuItem value='RSI_AND_ATR' style={{display: 'flex', justifyContent: 'space-between'}}
                              onClick={() => handleChangeStudiesChart(StudiesChart.RSI_AND_ATR)}>
                        <span>RSI and ATR</span>
                        <Switch
                            checked={isStudiesChartInclude(StudiesChart.RSI_AND_ATR)}
                            onClick={() => handleChangeStudiesChart(StudiesChart.RSI_AND_ATR)}
                            name="enableDisableRSIAndATR"
                            color="primary"
                        /></MenuItem>
                    <MenuItem value='FORCEINDEX' style={{display: 'flex', justifyContent: 'space-between'}}
                              onClick={() => handleChangeStudiesChart(StudiesChart.FORCE_INDEX)}>
                        <span>ForceIndex</span>
                        <Switch
                            checked={isStudiesChartInclude(StudiesChart.FORCE_INDEX)}
                            onClick={() => handleChangeStudiesChart(StudiesChart.FORCE_INDEX)}
                            name="enableDisableForceIndex"
                            color="primary"
                        /></MenuItem>
                    <MenuItem value='STOCHASTIC_OSCILLATOR' style={{display: 'flex', justifyContent: 'space-between'}}
                              onClick={() => handleChangeStudiesChart(StudiesChart.STOCHASTIC_OSCILLATOR)}>
                        <span>Stochastic Oscillator</span>
                        <Switch
                            checked={isStudiesChartInclude(StudiesChart.STOCHASTIC_OSCILLATOR)}
                            onClick={() => handleChangeStudiesChart(StudiesChart.STOCHASTIC_OSCILLATOR)}
                            name="enableDisableStochasticOscillator"
                            color="primary"
                        /></MenuItem>
                    <MenuItem value='ELDER_IMPULSE' style={{display: 'flex', justifyContent: 'space-between'}}
                              onClick={() => {
                                  handleChangeStudiesChartWithTooltip(StudiesChart.ELDER_IMPULSE)
                                  setDisableVolume(!disableVolume)
                                  handleChangeStudiesChart(StudiesChart.MACD)
                                  // setDisableMACD(!disableMACD)
                              }}>
                        <span>Elder Impulse</span>
                        <Switch
                            checked={isStudiesChartWithTooltipInclude(StudiesChart.ELDER_IMPULSE)}
                            onClick={() =>{ handleChangeStudiesChartWithTooltip(StudiesChart.ELDER_IMPULSE)
                                setDisableVolume(!disableVolume)
                                handleChangeStudiesChart(StudiesChart.MACD)
                                // setDisableMACD(!disableMACD)
                            }}
                            name="enableDisableOHLCSeries"
                            color="primary"
                        /></MenuItem>
                    <MenuItem value='BOLLINGER_BAND' style={{display: 'flex', justifyContent: 'space-between'}}
                              onClick={() => handleChangeStudiesChartWithTooltip(StudiesChart.BOLLINGER_BAND)}>
                        <span>Bollinger Band</span>
                        <Switch
                            checked={isStudiesChartWithTooltipInclude(StudiesChart.BOLLINGER_BAND)}
                            onClick={() => handleChangeStudiesChartWithTooltip(StudiesChart.BOLLINGER_BAND)}
                            name="enableDisableMovingAverage"
                            color="primary"
                        /></MenuItem>
                </Menu>
                <IconButton
                    aria-label="Save Chart"
                    aria-haspopup="true"
                    aria-expanded={saveMenuOpen ? 'true' : undefined}
                    onClick={handleSaveMenuToggle}
                    color="inherit"
                >
                    <Typography variant="caption" sx={{mr: 1}} classes={{root: 'toolbar-select'}}>
                        {saveName === '' ? 'Save Chart' : saveName}
                        <Box component="span" sx={{ ml: 1 }}>
                            <CloudDownload />
                        </Box>
                    </Typography>
                    <ExpandMoreIcon/>
                </IconButton>
                <Menu
                    anchorEl={saveAnchorEl}
                    open={saveMenuOpen}
                    onClose={() => setSaveMenuOpen(false)}
                >
                    <MenuItem value='Save Layout' style={{display: 'flex', justifyContent: 'space-between'}}
                              onClick={() => setOpenSaveDialog(true)}>
                        <span>Save Layout</span>
                        <Save/>
                    </MenuItem>
                    <MenuItem value='Load Layout' style={{display: 'flex', justifyContent: 'space-between'}}
                              onClick={() => openSaveModal()}>
                        <span>Load Layout</span>
                        <CloudDownload/>
                    </MenuItem>
                </Menu>
                <Dialog open={openSaveDialog} onClose={closeSaveDialog}>
                    <DialogTitle>Save Layout</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="name"
                            type="text"
                            fullWidth
                            variant="standard"
                            value={saveName}
                            onChange={(e) => setSaveName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSave();
                                }
                            }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCancel} color="secondary">
                            Cancel
                        </Button>
                        <Button onClick={handleSave} color="primary">
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={isOpenSave} onClose={closeSaveModal}>
                    <DialogTitle sx={{bgcolor: getDesignTokens(themeMode).palette.chartBackground}}>Local Storage Items</DialogTitle>
                    <DialogContent sx={{bgcolor: getDesignTokens(themeMode).palette.chartBackground}}>
                        <Box mb={2}  sx={{minWidth:500 , bgcolor: getDesignTokens(themeMode).palette.chartBackground}}>
                            <br/>
                                <TextField
                                autoFocus={true}
                                fullWidth
                                label="Search"
                                value={saveSearchTerm}
                                onChange={handleSearchChange}
                                variant="outlined"
                            />
                        </Box>
                        <List  sx={{minHeight:400}}>
                            {filteredItems.length > 0 ? (
                                filteredItems.map((item) => (
                                    <ListItem button key={item} onClick={() => handleItemClick(item)}>
                                        <ListItemText primary={item.replace('chart_', '')} />
                                    </ListItem>
                                ))
                            ) : (
                                <ListItem>
                                    <ListItemText primary="No items in Local Storage" />
                                </ListItem>
                            )}
                        </List>
                    </DialogContent>
                    <DialogActions sx={{bgcolor: getDesignTokens(themeMode).palette.chartBackground}}>
                        <Button onClick={closeSaveModal} color="primary">Close</Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    )
}

export default Toolbar;
