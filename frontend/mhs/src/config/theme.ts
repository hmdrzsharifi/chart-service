import {createTheme, PaletteMode} from "@mui/material";
import {amber, deepOrange, grey} from "@mui/material/colors";

// const theme = createTheme({
//     palette: {
//         primary: {
//             main: '#fff',
//         },
//         secondary: {
//             main: '#f44336',
//         },
//     },
// });

const getDesignTokens = (mode: PaletteMode) => ({
    palette: {
        mode,
        ...(mode === 'light'
            ? {
                // palette values for light mode
                primary: {
                    main:'#67c1b7'
                },
                backgroundBar: '#f8f8f8',
                borderBar: '#ddd',
                chartBackground: '#fff',
                lineColor: '#838383',
                grindLineColor: '#f7f7f7',
                edgeStroke: '#000',
                text: {
                    primary: '#000',
                    secondary: grey[800],
                },
            }
            : {
                // palette values for dark mode
                primary: {
                    main:'#67c1b7'
                },
                backgroundBar: '#151f28',
                borderBar: '#000',
                chartBackground: '#1c2a35',
                lineColor: '#d0d2d4',
                grindLineColor: '#21323f',
                edgeStroke: '#fff',
                text: {
                    primary: '#c7c9cb',
                    secondary: grey[500],
                },
            }),
    },
});

export default getDesignTokens;
