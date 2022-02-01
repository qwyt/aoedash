import {Theme, ThemeOptions} from "@mui/material";
import * as React from "react";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import Dashboard from "./Dashboard";
import {red} from '@mui/material/colors';


// import TrajanusRoman from 'TrajanusRoman.ttf';

export const BuildDefaultTheme = (mode: 'light' | 'dark') => {
    return {
        typography: {
            fontFamily: [
                "Futura",
                "Century Gothic", "Corbel", "Sans-Serif"
            ].join(','),

            body2: {
                fontFamily: "Sans-Serif"
            }
        },
        palette: {
            // primary: {
            //     // main: red[500],
            // },
            //
            mode,
            disabled: {
                main: "grey"
            },
            values: {
                negative: "red",
                positive: "green",

                plotLine: mode === "dark" ? "cyan" : "blue"
            },

            chartColors: {
                1: mode === "dark" ? "cyan" : "blue",
                2: mode === "dark" ? "orange" : "orange",
                3: mode === "dark" ? "yellow" : "yellow",
                4: mode === "dark" ? "green" : "green",
                5: mode === "dark" ? "#663399" : "#663399",
                6: mode === "dark" ? "green" : "green",
                7: mode === "dark" ? "red" : "red",
                8: mode === "dark" ? "pink" : "pink",
                9: mode === "dark" ? "cyan" : "blue",
                10: mode === "dark" ? "cyan" : "blue"
            }



            // text: {
            //     disabled: "orange",
            //     primary: "orange",
            //     secondary: "orange"
            // }

        },
        components: {
            MuiCard: {
                styleOverrides: {
                    root: {
                        backgroundColor: mode === "dark" ? "rgb(43,43,43)" : undefined,
                        // color: theme.palette.primary.contrastText,
                    }
                }
            }
        },
        // overrides: {
        //     MuiCssBaseline: {
        //         '@global': {
        //             '@font-face': [TrajanusRoman],
        //         }
        //     }
        // }
    }
}


// Used for storybooks
// TODO use in app as well
export const DefaultThemeWrapper = (props: { children: any }) => {

    const theme: Theme = createTheme(BuildDefaultTheme("light"));
    // const theme: Theme  = createTheme(BuildDefaultTheme("dark"));
    // const theme: Theme = React.useMemo(
    //     () =>
    //         createTheme(BuildDefaultTheme("dark")),
    //     [],
    // );
    return <ThemeProvider theme={theme}>
        {props.children}
    </ThemeProvider>

}