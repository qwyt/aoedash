import React from "react";
import {useContext, useState} from "react";
import {AppSettingsContext} from "../../App";
import {DataRendererExtensions, IPathObjectExtension, IViewInfoExtensions} from "../DefaultDataRenderer";
import {DefaultDataTableForNewDataTable, IDataTableForNewNewDataTable} from "./DataTable";
import {Box, Button, IconButton} from "@mui/material";
import TableRowsSharpIcon from '@mui/icons-material/TableRowsSharp';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import {ObjectScatterPlot} from "../ObjectScatterPlot";
import {DataTableWrapper} from "./DataTableWrapper";


export function TableOrScatterPlotRenderer(props: IDataTableForNewNewDataTable & DataRendererExtensions & IViewInfoExtensions & IPathObjectExtension) {

    const appSettings = useContext(AppSettingsContext)

    const getDefaultMode = () => {
        return appSettings.getDataViewMode() === "scatter" ? "scatter" : "table"
    }

    const [mode, setMode] = useState<"scatter" | "table">(getDefaultMode())

    const controlMode = <IconButton onClick={() => {
        setMode(mode === "scatter" ? "table" : "scatter")
    }}>
        {mode === "table" ? <ScatterPlotIcon/> : <TableRowsSharpIcon/>}
    </IconButton>

    let title = props.viewInfo.title;

    if (title === "maps_table"){
        title = "Maps"
    }
    else if (title === "civs_table"){
        title = "Civs"
    }


    let content: JSX.Element
    if (mode === "table") {
        content = <DefaultDataTableForNewDataTable {...props}
                                                   title={title}
                                                   expanded={true}
                                                   filterComponents={[controlMode]}
        />
    } else {
        content = <DataTableWrapper expanded={true} filterComponents={[controlMode]} title={title}>
            {/*SCATTER!*/}

            <ObjectScatterPlot key={props.dataKey} dataKey={props.dataKey} baselineDataProviders={[]} path={props.path} data={props.data}/>
        </DataTableWrapper>
    }

    return <Box>
        {content}
    </Box>
    //     let content: JSX.Element
    // if (mode === "table") {
    //     content = <DefaultDataTableForNewDataTable {...props}
    //         expanded={true}
    //                                                // independent={true}
    //                                                filterComponents={[controlMode]}
    //     />
    // } else {
    //     content = <ObjectScatterPlot baselineDataProviders={[]} path={props.path} data={props.data}/>
    // }
    //
    //
    // return <Box>
    //     <DataTableWrapper filterComponents={[controlMode]} title={props.viewInfo.title}>
    //         {content}
    //     </DataTableWrapper>
    // </Box>

}