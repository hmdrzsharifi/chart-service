import {
    Chart, XAxis, YAxis, MouseCoordinateX, MouseCoordinateY, ElderRaySeries, SingleValueTooltip, elderRay

} from "react-financial-charts";
import * as React from "react";
import {STUDIES_CHART_HEIGHT} from "../../config/constants";
import useStore from "../../util/store";
import useDesignStore from "../../util/designStore";
import {useState} from "react";
import {mouseEdgeAppearance} from "../../indicator/indicatorSettings";
// import getDesignTokens from "../../config/theme";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {Button} from "@mui/material";
import {StudiesChart} from "../../type/Enum";
import {xAndYColors} from "../../util/utils";
import getDesignTokens from "../../config/theme";

const ElderRayStudiesChart = (props: {
    displayFormat: any,
    margin: any,
    pricesDisplayFormat: any,
    elderAccessor: any,
    yExtents: any,
    origin: any
}) => {

    const {studiesCharts, setStudiesCharts} = useStore();
    const {themeMode} = useDesignStore();

    // states
    const [openElderRayModal, setOpenElderRayModal] = useState<boolean>(false);

    const elderRayOrigin = (_: number, h: number) => [0, h - studiesCharts.length * STUDIES_CHART_HEIGHT];

    return (
        <Chart id={3}
               height={STUDIES_CHART_HEIGHT}
               yExtents={props.yExtents}
               origin={elderRayOrigin}
               padding={{top: 8, bottom: 8}}
        >
            <XAxis showGridLines {...xAndYColors(themeMode)}/>
            <YAxis ticks={4} tickFormat={props.pricesDisplayFormat} {...xAndYColors(themeMode)}/>

            <MouseCoordinateX displayFormat={props.displayFormat}/>
            <MouseCoordinateY rectWidth={props.margin.right} displayFormat={props.displayFormat}/>
            <MouseCoordinateY
                at="right"
                orient="right"
                displayFormat={props.displayFormat}
                {...mouseEdgeAppearance}/>
            <ElderRaySeries yAccessor={props.elderAccessor}/>
            <SingleValueTooltip
                valueFill={getDesignTokens(themeMode).palette.text.primary}
                className='elderChart'
                xInitDisplay='200px'
                onClick={() => setOpenElderRayModal(true)}
                yAccessor={props.elderAccessor}
                yLabel="Elder Ray"
                yDisplayFormat={(d: any) =>
                    `${props.pricesDisplayFormat(d.bullPower)}, ${props.pricesDisplayFormat(d.bearPower)}`
                }
                origin={[8, 16]}
            />

            <Modal
                open={openElderRayModal}
                onClose={() => setOpenElderRayModal(false)}
                sx={{maxHeight: '95%'}}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4
                }}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        changing
                    </Typography>
                    <Button color='error' title='disable ElderRay' onClick={() => {
                        setStudiesCharts(studiesCharts.filter(item => item !== StudiesChart.ELDER_RAY))
                        setOpenElderRayModal(false)
                    }}> disable ElderRay </Button>
                </Box>
            </Modal>
        </Chart>
    )
}

export default ElderRayStudiesChart;
