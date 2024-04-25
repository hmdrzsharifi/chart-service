import React from 'react';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import {TimeFrames} from "../type/Enum";
import useStore from "../util/store";

const Footer = (props: any) => {

    const {timeFrame, setTimeFrame} = useStore();

    return (
        <div className="footer" style={props.style}>
            {/*<BottomNavigation*/}
            {/*    value={timeFrame}*/}
            {/*    showLabels*/}
            {/*    classes={{ root: 'timeframe-menu-root' }}*/}
            {/*    sx={{ justifyContent: 'flex-end' }}*/}
            {/*    onChange={(event, newValue) => setTimeFrame(newValue)}*/}
            {/*>*/}
            {/*    {TimeFrames.map((item: any, index: number) => {*/}
            {/*        return <BottomNavigationAction value={item} label={item} sx={{*/}
            {/*            borderRight: [0,4].includes(index) ? 'solid 3px #ccc' : 'none',*/}
            {/*        }} />*/}
            {/*    })}*/}

            {/*</BottomNavigation>*/}
        </div>
    )
}

export default Footer;
