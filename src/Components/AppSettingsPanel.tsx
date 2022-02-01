import {Box, Button, Drawer, Link, Popover, Stack, Typography} from "@mui/material";
import * as React from 'react';
import {
    DatasetSelectionButtonGroup,
    IToggleButtonGroupButtonData
} from "./DescriptiveStats/DatasetSelectionButtonGroup";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import BrightnessAutoIcon from '@mui/icons-material/BrightnessAuto';

import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import AppsIcon from '@mui/icons-material/Apps';
import TableRowsSharpIcon from '@mui/icons-material/TableRowsSharp';
import {AppSettingsContext} from "../App";
import {useContext} from "react";


export interface IAppSettingsPanelProps {
    id: string
    show: { set: (v: boolean) => void, value: boolean }
}

interface ISettingsObjectProps {
    label: string
    content: JSX.Element
}

const SettingsObject = (props: ISettingsObjectProps) => {

    return <Stack direction={"column"} alignItems={"start"} width={"100%"}>
        <Typography variant={"subtitle2"}>
            {props.label}
        </Typography>
        <Box>
            {props.content}
        </Box>
    </Stack>
}


export const SettingsDefaultSkin = () => {

    const settings = useContext(AppSettingsContext);


    let defaultButton: IToggleButtonGroupButtonData = {
        disabled: false,
        icon: <BrightnessAutoIcon/>,
        label: "Auto (System)",
        onClick(): void {
            settings.setColorMode("")

        }, selected: settings.getColorMode() === ""
    }
    let darkButton: IToggleButtonGroupButtonData = {
        disabled: false,
        icon: <Brightness4Icon/>,
        label: "Dark",
        onClick(): void {
            settings.setColorMode("dark")
        }, selected: settings.getColorMode() === "dark"
    }
    let lightButton: IToggleButtonGroupButtonData = {
        disabled: false,
        icon: <Brightness7Icon/>,
        label: "Light",
        onClick(): void {
            settings.setColorMode("light")
        }, selected: settings.getColorMode() === "light"
    }

    return <SettingsObject label={"Skin"} content={
        <DatasetSelectionButtonGroup showIcons
                                     showLabels
                                     buttons={[defaultButton, lightButton, darkButton]}/>}/>

}

export const SettingsDefaultDataView = () => {
    const settings = useContext(AppSettingsContext);
    const mode = settings.getDataViewMode()

    let defaultButton: IToggleButtonGroupButtonData = {
        disabled: false,
        icon: <ScatterPlotIcon/>,
        label: "Scatter",
        onClick: () => settings.setDataViewMode("scatter"),
        selected: mode === "scatter"
    }
    let darkButton: IToggleButtonGroupButtonData = {
        disabled: false,
        icon: <AppsIcon/>,
        label: "Grid",
        onClick: () => settings.setDataViewMode("grid"),
        selected: mode === "grid"
    }
    let lightButton: IToggleButtonGroupButtonData = {
        disabled: false,
        icon: <TableRowsSharpIcon/>,
        label: "Table",
        onClick: () => settings.setDataViewMode("table"),
        selected: mode === "table"
    }

    return <SettingsObject label={"Default Data View"} content={
        <DatasetSelectionButtonGroup showIcons
                                     showLabels
                                     buttons={[defaultButton, lightButton, darkButton]}/>}/>

}

export function AppSettingsPanel(props: IAppSettingsPanelProps) {


    return <Drawer
        anchor={"right"}
        open={props.show.value}
        onClose={() => {
            props.show.set(false)
        }}
    >
        <Box marginTop={"60px"} padding={"10px"} minWidth={"250px"} height={"100%"}>
            <Stack justifyContent={"space-between"} height={"100%"}>
                <Stack justifyContent={"start"} spacing={2} width={"100%"}>
                    <Typography variant={"h6"}>Settings</Typography>
                    <SettingsDefaultSkin/>
                    <SettingsDefaultDataView/>
                </Stack>
                <Stack justifyContent={"start"} spacing={2} width={"100%"} fontSize={"0.875rem"} >
                    <Typography variant={"h6"}>About</Typography>
                    <Box>
                        Have any questions, suggestions or issues?
                    </Box>
                    <Stack direction={"row"} spacing={1}>
                        <Box>
                            Contact me on:</Box>
                        <Box>
                            <Link href={"https://www.reddit.com/user/tetrakishexahedron"}>Reddit</Link> or <Link
                            href={"https://discordapp.com/channels/@me/qwyt#7385/"}>Discord</Link></Box>
                    </Stack>

                    <Box marginTop={"10px"}>Uses data from on aoe2.net</Box>

                    <Box marginTop={"10px"}>Created by [USER]</Box>
                </Stack>
            </Stack>
        </Box>
    </Drawer>

    // return <Popover
    //     id={props.id}
    //     onClose={() => {
    //         props.show.set(false)
    //     }}
    //     open={props.show.value}
    //     anchorOrigin={{
    //         vertical: 'bottom',
    //         horizontal: 'right',
    //     }}
    //     transformOrigin={{
    //         vertical: 'top',
    //         horizontal: 'right',
    //     }}
    // >
    //     The content of the Popover.
    // </Popover>

}