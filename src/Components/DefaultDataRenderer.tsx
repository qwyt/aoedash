import * as React from 'react';
import JSONTree from 'react-json-tree';
import {GridView} from "./Grid/GridView";
import {DataModelType, TEloBracket} from "../Data/CheckType";
import {GridItem} from "./Grid/GridItem";
import {useContext, useState} from "react";
import {Box, IconButton, Typography} from "@mui/material";

import AppsIcon from '@mui/icons-material/Apps';
import TableRowsSharpIcon from '@mui/icons-material/TableRowsSharp';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';

import DataTable, {
    DataTableForDataGroups,
    DataTableForPlayersList,
    IPaginationRequest,
    ISortRequest
} from "./Table/DataTable";
import {IPatchHistoryChartProps, ItemDetailsView} from './ItemDetails/ItemDetailsView';
import {NewDataSet, ViewRequestData} from "../Data/ModelGenerated";
import {getLabelForPath, TTableServersude} from "../Internal/DataProvider";
import {DataProviderResponseMetaData} from "../Data/Model";
import {ObjectScatterPlot, ScatterPlotBaselineProvider} from "./ObjectScatterPlot";
import {AppSettingsContext, IAppSettingsContext, TDefaultDataView} from "../App";
import {TBaselineTableGroupSampleDelegate} from "../Data/BaselineProviders";
import {DatasetSummaryViewRenderer} from "./DatasetSummary/DatasetSummaryViewRenderer";

export interface IDefaultDataRendererProps {
    dataKey: string
    data: any
    itemType: DataModelType
    disableGrid?: boolean
    disabledChart?: boolean
    pagination?: IPaginationRequest
    serversideSort?: ISortRequest
    tableServerside?: TTableServersude

    metaData?: DataProviderResponseMetaData
    getBaselineData?: TBaselineTableGroupSampleDelegate

}

export interface IPathObjectExtension {
    path: { value: string[], set: (path: string[]) => void }
    dataKey: string
}

export interface DataRendererExtensions {
    compactView?: boolean
    pagination?: IPaginationRequest
    serversideSort?: ISortRequest
    filterComponents?: JSX.Element[]

    tableServerside?: TTableServersude
    baselineEloBracket?: TEloBracket
    getBaselineData?: TBaselineTableGroupSampleDelegate

}

export interface IViewInfoExtensions {
    viewInfo: { title: string }
    viewRequestData?: ViewRequestData
}

export function GridOrDataTableOrChartRenderer(props: IDefaultDataRendererProps & IPathObjectExtension & IViewInfoExtensions) {

    const settings = useContext(AppSettingsContext)

    const getDefaultMode = () => {
        let mode = settings.getDataViewMode()

        if (mode === "grid" && props.disableGrid) {
            mode = "table"
        } else if (mode === "scatter" && props.disableGrid) {
            mode = props.disableGrid ? "table" : "grid"
        }
        return mode
    }

    let [mode, setMode] = useState<TDefaultDataView>(getDefaultMode())
    // let [useGrid, setUseGrid] = useState(!props.disableGrid)

    const iconsForMode: { [mode: string]: { enabled: boolean, icon: JSX.Element } } = {
        "scatter": {enabled: !props.disableGrid, icon: <ScatterPlotIcon/>},
        "grid": {enabled: !props.disableGrid, icon: <AppsIcon/>},
        "table": {enabled: !props.disableGrid, icon: <TableRowsSharpIcon/>},
    }


    const getNextMode = (startMode: TDefaultDataView) => {
        let selectedMode = startMode
        do {
            const currentModeIndex = Object.keys(iconsForMode).indexOf(selectedMode);
            let nextModeKey = currentModeIndex + 1 >= Object.keys(iconsForMode).length ? 0 : currentModeIndex + 1;
            selectedMode = Object.keys(iconsForMode)[nextModeKey] as TDefaultDataView

            if (iconsForMode[selectedMode].enabled) {
                return selectedMode;
            }
        } while (selectedMode !== startMode)
        return selectedMode
    }


    const nextMode: TDefaultDataView = getNextMode(mode)


    let baselineDataProviders: ScatterPlotBaselineProvider[] | undefined = props.getBaselineData ? [{
        label: "Elo Brackets",
        key: "elo",
        getBaselineData: props.getBaselineData
    }] : []

    return <Box sx={{width: "100%"}}>
        <Box sx={{display: "flex", justifyContent: "space-between", marginBottom: "5px"}}>
            {props.data.label && <Box alignSelf={"center"}><Typography variant={"h5"} component={"h2"}>{getLabelForPath(props.path.value)}</Typography> </Box> }
            <Box sx={{display: "flex"}}>
                {(nextMode !== mode) &&

                    <IconButton onClick={() => {
                        setMode(nextMode)
                    }}>
                        {iconsForMode[nextMode].icon}
                    </IconButton>}

            </Box>
        </Box>
        {/*<JSONTree data={props.data}/>*/}
        {mode === "scatter" ? <ObjectScatterPlot
            key={props.dataKey}
            dataKey={props.dataKey}
            // key={props.data}
            baselineDataProviders={baselineDataProviders}
            data={props.data}
            path={props.path}/> : (mode === "grid" ?
            <GridView dataKey={props.dataKey}
                      path={props.path} data={props.data}/> :
            <DataTableForDataGroups
                dataKey={props.dataKey}

                path={props.path}
                viewInfo={props.viewInfo}
                serversideSort={props.serversideSort}
                tableServerside={props.tableServerside}
                data={props.data}
                pagination={props.pagination}/>)}
    </Box>
}

export function DefaultDataRenderer(props: IDefaultDataRendererProps & IPathObjectExtension) {


    if (props.itemType === "NewDataTableGroupWithSummary") {
        return <ItemDetailsView {...props}/>
    } else if (props.itemType === "NewDataGroup") {
        let viewInfo = {
            title: props.itemType
        }

        if (props.data.hasOwnProperty("name")) {
            viewInfo.title = props.data.name;
        }

        if (props.data.name === "Players") {

            return <DataTableForPlayersList
                dataKey={props.dataKey}
                path={props.path}
                viewInfo={viewInfo}
                serversideSort={props.serversideSort}
                tableServerside={props.tableServerside}

                data={props.data}
                pagination={props.pagination}/>

        } else {
            return <React.Fragment>
                <GridOrDataTableOrChartRenderer viewInfo={viewInfo} {...props}/>
                <JSONTree data={props.data}/>
            </React.Fragment>
        }
    } else if (props.itemType === "NewDataSet") {
        return <DatasetSummaryViewRenderer data={props.data as NewDataSet}/>
    }

    return <div>type:[{props.itemType}]
        <div><JSONTree data={props.data}/></div></div>
}