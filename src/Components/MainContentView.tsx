import * as React from 'react';
import {useContext, useEffect, useState} from 'react';

import {DefaultDataRenderer} from "./DefaultDataRenderer";
import {DataProviderContext, TDataSourceContextDataView} from "../Internal/DataProvider";
import Typography from "@mui/material/Typography";
import {Box, CircularProgress, Container} from "@mui/material";
import {SampleSummaryValue} from "../Data/ModelGenerated";
import JSONTree from "react-json-tree";


export function MainContentView() {

    let dataContext = useContext(DataProviderContext)

    const [loadedDataView, setLoadedDataView] = useState<TDataSourceContextDataView | undefined>()


    useEffect(() => {

        if (dataContext == null)
            return
        let dataViewPotentialPromise = dataContext.getSelectedDataView()

        if (dataViewPotentialPromise instanceof Promise) {
            let dataViewPromise = dataViewPotentialPromise as Promise<TDataSourceContextDataView>
            setLoadedDataView(undefined)
            dataViewPromise.then(((data) => {
                let hasData = data.data !== null
                // let hasData = data.data !== null && data.data.name !== undefined;
                let hasJobInfo = !(!data.metaData?.scheduled_or_running_job)
                if (hasData) {
                    setLoadedDataView(data)
                } else {
                    throw Error(`Unrecgonized data: ${JSON.stringify(data)}`)
                }
            }))
        } else {
            setLoadedDataView(dataViewPotentialPromise as TDataSourceContextDataView)
        }
    }, [dataContext?.getSelectedDataView])

    if (dataContext === null) {
        return <Typography>LoAdInG!</Typography>
    }


    // Promise.resolve(dataViewPotentialPromise).then(function (value) {
    //     setLoadedDataView(value)
    // })
    //
    let _loadedDataView = loadedDataView;

    if (!_loadedDataView) {
        return <Container maxWidth={"lg"}
                          sx={{display: "flex", justifyContent: "center", height: "75vh", alignItems: "center"}}
        >
            <CircularProgress size={"5rem"}/>
        </Container>
    } else if (!_loadedDataView.data) {
        return <Container maxWidth={"lg"}
                          sx={{display: "flex", justifyContent: "center", height: "75vh", alignItems: "center"}}
        >
            <CircularProgress size={"5rem"}/>
            {/*<JSONTree data={_loadedDataView}/>*/}
        </Container>

    }
    let disableGrid = false;
    if (_loadedDataView.data.name === "Players") {
        disableGrid = true
    }

    return <Box sx={{minHeight: "75vh"}}>
        <DefaultDataRenderer
            dataKey={dataContext.datasetKey}
            getBaselineData={dataContext.getBaselineData}
            serversideSort={dataContext.serversideSort}
            pagination={dataContext.pagination}
            data={_loadedDataView.data}
            itemType={_loadedDataView.itemType}
            metaData={_loadedDataView.metaData}
            path={dataContext.path}
            tableServerside={dataContext.tableServerside}
            disableGrid={disableGrid}/>
    </Box>
}