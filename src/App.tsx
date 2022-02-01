import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import {useTheme, ThemeProvider, createTheme} from '@mui/material/styles';
import Dashboard from "./Dashboard";
import {Theme} from "@mui/material";
import {useEffect} from "react";
import {BuildDefaultTheme} from "./Theme";

export type TColorMode = "" | "light" | "dark"
export type TDefaultDataView = "scatter" | "table" | "grid"

export interface IAppSettingsContext {
    setColorMode: (mode: TColorMode) => void;
    getColorMode: () => TColorMode;
    toggleColorMode: () => void;
    setDataViewMode: (mode: TDefaultDataView) => void;
    getDataViewMode: () => TDefaultDataView,

}

export const AppSettingsContext = React.createContext<IAppSettingsContext>({
    setColorMode: (mode: TColorMode) => {
    },
    getColorMode: () => "light",
    toggleColorMode: () => {
    },

    setDataViewMode: (mode: TDefaultDataView) => {
    },
    getDataViewMode: () => "scatter",


});

const SETTINGS_PREFIX = "app_settings_field__"

const getSystemColorMode: () => "light" | "dark" = () => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return "dark"
    }
    return "light"

}

export default function ToggleColorMode() {
    const saveSettingsVal = (key: string, val: string) => {
        return localStorage.setItem(`${SETTINGS_PREFIX}${key}`, val)
    }
    const getSettingsVal = (key: string) => {
        return localStorage.getItem(`${SETTINGS_PREFIX}${key}`)
    }

    const getDefaultColorMode = () => {
        let v = getSettingsVal("mode")
        return (v ? v : "") as TColorMode
    }

    const getDefaultDataView = () => {
        let v = getSettingsVal("defaultDataView")
        return (v ? v : "scatter") as TDefaultDataView
    }

    useEffect(() => {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            const newColorScheme = event.matches ? "dark" : "light";
            setMode(newColorScheme)
        });

    }, [])


    const [mode, _setMode] = React.useState<TColorMode>(getDefaultColorMode());
    const [defaultDataView, setDefaultDataView] = React.useState<TDefaultDataView>(getDefaultDataView());

    let modeSet: "light" | "dark" = mode === "" ? getSystemColorMode() : mode


    const setMode = (c: TColorMode) => {
        saveSettingsVal("mode", c)
        _setMode(c)
    }

    const colorMode: IAppSettingsContext =
        // React.useMemo(
        // () => (
        {
            setColorMode: (mode: TColorMode) => {
                setMode(mode);
            },
            getColorMode: () => {
                return mode
            },
            toggleColorMode: () => {
                if (modeSet === "dark") {
                    setMode("light")
                } else {
                    setMode("dark")
                }
            },
            setDataViewMode: (mode: TDefaultDataView) => {
                saveSettingsVal("defaultDataView", mode)
                setDefaultDataView(mode)
            },
            getDataViewMode: () => defaultDataView
        }
    // ),
    // [],
    // );


    const theme: Theme = React.useMemo(
        () =>
            createTheme(BuildDefaultTheme(modeSet)),
        [modeSet],
    );
    useEffect(() => {
        let path = window.location.href.substring(window.location.href.lastIndexOf('/') + 1)
        if (path.length === 0) {
            // window.location.href = "/EmpireWars_Stats"
            window.location.href = "/RM_Stats"
        }
    });

    return (
        <AppSettingsContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <Dashboard/>
            </ThemeProvider>
        </AppSettingsContext.Provider>
    );
}
