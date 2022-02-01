import * as React from 'react';
import {
    DatasetSplitByEloCollection,
    IconData,
    NewDataGroup,
    NewDataSet,
    NewDataTableGroupWithSummary, PlayerStatsViewQueryResponse, PlayerTableNames,
    SampleSummaryValue
} from "../Data/ModelGenerated";
import {useEffect, useState} from "react";
import {END_POINTS_URL} from "../Data/config";
import {ISidebarItem, ISideBarNavData, TSidebarItemCollection} from "../Components/Sidebar";
import {
    DataItemType,
    DataModelType, DatasetSplitByEloCollectionWithLabel,
    getDataModelType, getDatasetInfo, getGroupedTablesKeys,
    getLabelForDataItemType, getTableGroups,
    isNewDataGroup,
    NewDataGroupWithLabel,
    NewDataGroupWithLabelPagedView,
    NewDataSampleWithSummary,
    NewDataSetWithLabel, TEloBracket, TStatsTableNames,
    TTableGroup
} from "../Data/CheckType";
import {Box, Typography} from "@mui/material";
import {IPaginationRequest, ISortRequest} from "../Components/Table/DataTable";
import {DataProviderResponseMetaData, TableGroupView} from "../Data/Model";
import {
    DatasetSplitByEloCollectionWithLabelBaselineProviderFactory,
    TBaselineTableGroupSampleDelegate
} from "../Data/BaselineProviders";


export type TDataSourceContextDataView = { data: any, itemType: DataModelType, metaData?: DataProviderResponseMetaData }
export type TTableServersude = { select: (props: { table: "civ" | "map_type", key: string } | null) => void, value: { table: "civ" | "map_type", key: string } | null }

export interface IDataSourceContext {
    // dataset: NewDataSet
    datasetKey: string
    getSelectedDataView: () => TDataSourceContextDataView | Promise<TDataSourceContextDataView>
    path: { value: string[], set: (path: string[]) => void }
    pagination?: IPaginationRequest
    serversideSort?: ISortRequest
    tableServerside?: TTableServersude

    // DatasetSplitByEloCollectionWithLabelBaselineProviderFactory
    getBaselineData?: TBaselineTableGroupSampleDelegate

    loadedPatchSummary: { [k: string]: SampleSummaryValue }
    // currentPath: string[]
}

export interface IDataProviderProps {
    dataset: TStatsTableNames
    selectedPatchVersion: string | null,
    selectedEloBracket: string | null,

    disabledDatasetPicker: { value: boolean, set: (v: boolean) => void },
    disabledPatchVersionPicker: { value: boolean, set: (v: boolean) => void },
    disabledEloBracketPicker: { value: boolean, set: (v: boolean) => void },

    lazyLoad: boolean;
    children: JSX.Element | JSX.Element[]

    sidebarNavData: { value: ISideBarNavData, set: (v: ISideBarNavData) => void }

    path: { value: string[], set: (p: string[]) => void }
    onLoadedPatchesData: (availablePatchVersions: { [version: string] : number }) => void
    onLoadedEloBracketData: (availableEloBrackets: string[] | null) => void
}

const fetchData = (async (tableName: string,
                          datasetName: PlayerTableNames,
                          lazy?: boolean,
                          profile_id?: string,
                          pagination?: { start: number, count: number },
                          sort?: { by: string | string[], asc?: boolean },
                          selectedPatchVersion?: string,
                          selectTable?: { table: "civ" | "map_type", key: string },
) => {

    let url: string | undefined;


    if (lazy && profile_id) {
        url = `${END_POINTS_URL}/table_view/${datasetName}/${profile_id}`
    } else if (!lazy) {
        url = `${END_POINTS_URL}/static_view/${tableName}/${selectedPatchVersion ? selectedPatchVersion : "latest"}`
    } else if (pagination && sort) {
        // if (sort === undefined) {
        //     url = `${END_POINTS_URL}/table_view/stats_views__players/${pagination.start}/${pagination.count}/?orderBy=n&asc=False`
        // } else {
        let orderBy = typeof sort.by === 'string' ? sort.by : sort.by.join("->")
        let asc = !!sort.asc;
        // alert(`$asc: ${asc}`)
        url = `${END_POINTS_URL}/table_view/${datasetName}/${pagination.start}/${pagination.count}/?orderBy=${orderBy}&asc=${(asc)}`
        // }
    }

    if (selectTable) {
        url = `${url}&${selectTable.table}=${selectTable.key}`
    }

    let retValue: any;

    if (url) {

        console.error(`\n\n url:\n ${url}\n\n`)

        let promise = fetch(url, {
            method: 'GET',
            headers: {
                'Accept-Encoding': 'gzip',
            },
        }).then((response) => {
            if (response.ok) {

                try {
                    return response.json()
                } catch (ex) {
                    console.error(`Could not parse ${url} :\n ${JSON.stringify(response)}`)
                    throw Error(`Failed to parse:\n url: ${url} \n Error: \n ${ex}`)
                }

            } else {
                console.error(`Failed ${url} :\n ${JSON.stringify(response)}`)
            }
        }).catch((error) => {
            throw Error(`Failed to fetch:\n url: ${url} \n Error: \n ${error}`)
        });

        const data = await promise;//Promise.any(promise);

        retValue = data
        // return retData
    }

    // console.error(`${JSON.stringify(retValue)}`)

    if (retValue !== undefined && retValue !== null) {
        // (JSON.stringify(retValue))
        return retValue
    }


    throw Error(`URL: ${url} did not return anything`)

});


const fetchAvailablePatchVersions = (async (tableName: string) => {

    let url: string | undefined;
    url = `${END_POINTS_URL}/static_view_versions/${tableName}`
    let promise = fetch(url, {method: 'GET'}).then((response) => {
        if (response.ok) {
            return response.json()
        }
    });

    const data = await promise;//Promise.any(promise);

    return data

});

export const getLabelForPath = (path: string[] ) => {

    let value: string = "";//props.path.join("->");

    if (path.length === 2) {

        if (path[0] === "grouped_tables" && path[1] === "map_type") {
            value = "Maps"
        } else if (path[0] === "grouped_tables" && path[1] === "civ") {
            value = "Civilizations"
        }
    }
    return <Typography> {value} </Typography>
}

const fetchDataStaticDataset = (async (tableName: string, patch_version: string, lazy?: boolean) => {

    let data: any | null = null

    let dsName: PlayerTableNames;

    if (tableName === "RM_Stats") {
        dsName = "stats_views__players_RM"
    } else {
        // else if (tableName === "EmpireWars_Stats"){
        dsName = "stats_views__players_RM"
    }

    data = await fetchData(tableName, dsName, lazy, undefined, undefined, undefined, patch_version)
    if (data === null)
        return null;

    let ds = data as NewDataSetWithLabel | DatasetSplitByEloCollectionWithLabel

    // let ds = data as NewDataSetWithLabel;
    // ds.label = "Civ Stats"


    const parse_dataset = (_ds: NewDataSetWithLabel) => {
        Object.keys(_ds.grouped_tables).forEach((k) => {
            let label = getLabelForDataItemType(_ds.grouped_tables[k].name as DataItemType)
            _ds.grouped_tables[k].label = label ? label : _ds.grouped_tables[k].name;

            Object.keys(_ds.grouped_tables[k].samples).forEach(kk => {
                // @ts-ignore
                _ds.grouped_tables[k].samples[kk].tableGroups.get = (key: string) => _ds.grouped_tables[k].samples[kk].tableGroups[key];
                // ds.grouped_tables[k].tableGroups.get = (key: string) => ds.grouped_tables[k].tableGroups[key];

            })
        })
        return _ds
    }


    if (ds.hasOwnProperty('DatasetSplitByEloCollection')) {


        let dsCollection = ds as DatasetSplitByEloCollectionWithLabel

        for (let key of Object.keys(dsCollection.dataset)) {
            dsCollection.dataset[key] = parse_dataset(dsCollection.dataset[key])
        }

        return {ds: dsCollection}

        // TODO add Elo brakcet picker
        // let target: { [k: string]: NewDataSetWithLabel } = {}
        //
        // Object.keys(dsCollection.dataset).map((k, i) => {
        //     target[k] = parse_dataset(dsCollection.dataset[k] as NewDataSetWithLabel)
        // })
        //
        // return {
        //     ds: {
        //         ...dsCollection,
        //         dataset: target
        //     }
        // }

    } else {
        return {ds: parse_dataset(ds as NewDataSetWithLabel)}
    }
    return {ds: ds};
});

const fetchPlayersTableWrappedIntoNewDataGroup = (async (pagination?: { start: number, count: number },
                                                         sort?: { by: string | string[], asc?: boolean },
                                                         selectTable?: { table: "civ" | "map_type", key: string }
) => {


    // let dataArray: [string, NewDataTableGroupWithSummary][] = await fetchData("TODO", true, undefined, pagination, sort)
    // if (dataArray === null)
    //     return null;
    let responseData: TableGroupView = await fetchData("TODO", "stats_views__players_EW", true, undefined, pagination, sort, undefined, selectTable)
    if (responseData === null)
        return null;


    // let data : {[key: string] : NewDataTableGroupWithSummary} = new Map<string, NewDataTableGroupWithSummary>()
    let data = new Map<string, NewDataTableGroupWithSummary>()

    responseData.table.forEach((i) => {
        data.set(i[0], i[1])
        // data[i[0]] = i[1]
    })

    let sample: NewDataSampleWithSummary = {name: "All", size: data.size, tableGroups: data}
    let samples = {"All": sample}

    let dg: NewDataGroupWithLabelPagedView = {
        label: "Players", name: "Players",
        size: Object.keys(data).length,
        samples: samples,
        // summary: {},
        viewData: responseData.viewData
    }
    return dg;

});


const fethPlayerProfileData = (async (profile_id: string) => {
    let data = await fetchData("TODO", "stats_views__players_EW", true, profile_id)
    if (data === null)
        return null;

    let dtg = data as PlayerStatsViewQueryResponse;

    // throw Error(JSON.stringify(dtg))

    return dtg;

});

export const DataProviderContext = React.createContext<IDataSourceContext | null>(null);

/**
 * Downloads a specific dataset, then depending on it's type either store full dataset in memory and provides
 * requested views or lazily downloads them (this should be opaque to the requester, i.e. UI should not care if the
 * dataset is static or lazily loaded.
 * @constructor
 */

//TODO store this in db isntead
const fixedPlayerInfoSidebarData: () => TSidebarItemCollection = () => {
    let items: TSidebarItemCollection = {}
    return items
}


export function DataProvider(props: IDataProviderProps) {

    // const [loadedDataSource, setLoadedDataset] = useState<NewDataSetWithLabel | DatasetSplitByEloCollectionWithLabel | null>(null)

    const [loadedDataSource, setLoadedDataSource] = useState<NewDataSetWithLabel | DatasetSplitByEloCollectionWithLabel | null>(null)
    const [selectedDataset, setSelectedDataset] = useState<NewDataSetWithLabel | null>(null)
    // const [currentPath, setCurrentPath] = useState<string[]>([])

    const {disableEloBracketPicker, setDisableEloBracketPicker} = {
        disableEloBracketPicker: props.disabledEloBracketPicker.value,
        setDisableEloBracketPicker: props.disabledEloBracketPicker.set
    }

    const getEloBrackets = (sourceDs: NewDataSetWithLabel | DatasetSplitByEloCollectionWithLabel | null) => {

        if (sourceDs && sourceDs.hasOwnProperty('DatasetSplitByEloCollection')) {
            let ds = sourceDs as DatasetSplitByEloCollection;
            return Object.keys(ds.dataset)
        } else {
            return null
        }
    }

    // const DEFAULT_ELO_BRACKET = ">1600";//"All"
    const DEFAULT_ELO_BRACKET: TEloBracket = "1200 - 1600";//"All"

    const getDataset = (ds: NewDataSetWithLabel | DatasetSplitByEloCollectionWithLabel | null, key?: string) => {


        let defaultDataset: NewDataSetWithLabel | null = null
        if (ds && ds.hasOwnProperty('DatasetSplitByEloCollection')) {
            let dsCollection = ds as DatasetSplitByEloCollectionWithLabel;
            if (key) {
                defaultDataset = dsCollection.dataset[key] as NewDataSetWithLabel;
            } else {
                defaultDataset = dsCollection.dataset[DEFAULT_ELO_BRACKET] as NewDataSetWithLabel;
            }
        } else {
            defaultDataset = ds as NewDataSetWithLabel;
        }
        return defaultDataset
    }

    const eloBrackets = getEloBrackets(loadedDataSource)

    //Set dataset based on selected Elo bracket is available, otherwise loadedDataSource == selectedDataset
    useEffect(() => {
        setSelectedDataset(getDataset(loadedDataSource, props.selectedEloBracket ? props.selectedEloBracket : undefined))

    }, [eloBrackets, loadedDataSource, props.selectedEloBracket])

    // const setLoadedDataset = (ds: NewDataSetWithLabel | DatasetSplitByEloCollectionWithLabel | null) => {
    //     _setLoadedDataset(ds);
    // }

    //
    // const eloBrackets: string[] | null = getEloBrackets(loadedDataset)
    //
    // useEffect(() => {
    //     props.onLoadedEloBracketData(eloBrackets)
    //     setDisableEloBracketPicker(eloBrackets !== null)
    // }, [eloBrackets])

    const [tableName, setTableName] = useState(props.dataset)

    const [selectTable, setSelectTable] = useState<null | { table: "civ" | "map_type", key: string }>(null)

    const currentPath = [...props.path.value]
    const setCurrentPath = (path: string[]) => {

        // window.scrollTo(0, 0);
        //
        // alert("DO SCROLLL")
        // container.scrollTop = 0
        setTimeout(() => {
            let container = document.getElementsByTagName("main");
            // let container = document.getElementById("main-container");
            if (container.length > 0) {
                // alert("D")
                // container[0].scroll({top: 0, behavior: 'smooth'});
                // @ts-ignore
                container[0].scroll({top: 0, behavior: 'instant'});
            }
        }, 0)

        props.path.set([props.dataset, ...path])
    }

    let [serverSideSortData, setServerSideSortData] = useState<{ by: string | string[], asc?: boolean }>({
        by: "n",
        asc: false
    })

    let [paginationData, setPaginationData] = useState<{ page: number, rowsPerPage: number, totalItems?: number }>({
        page: 0,
        rowsPerPage: 20,
    })
// }>({
//         page: 0,
//         rowsPerPage: 0,
//         setPage(p: number): void {setPagination({...pagination, page: p})},
//         setRowsPerPage(i: number): void {}, totalItems: 0
//     })

    let viewType: "static" | "stats_views__players" = props.path.value[0] === "stats_views__players" ? "stats_views__players" : "static"

    // TODO remove, no longer needed now summary is included directly in NewDataTableGroupWithSummary
    // IIRC this was needed to not duplicate data when all patch datasets were loaded at the same time
    // however now the API is called for each patch, and a civ has only a single entry in the whole dataset
    const [loadedPatchSummary, setLoadedPatchSummary] = useState<{ [k: string]: SampleSummaryValue }>({});

    const {disablePatchPicker, setDisabledPatchPicker} = {
        disablePatchPicker: props.disabledPatchVersionPicker.value,
        setDisabledPatchPicker: props.disabledPatchVersionPicker.set
    }


    useEffect(() => {
        let showSummary = false
        if (currentPath.includes("civ")) {
            if (currentPath.includes("samples")) {
                if (currentPath.includes("All")) {
                    if (currentPath.includes("tableGroups")) {
                        let temp = currentPath;

                        showSummary = true

                        let dataPromise = getSelectedDataviewForDataset([temp[0], temp[1]])
                        Promise.resolve(dataPromise).then((value) => {

                            if (value.data && isNewDataGroup(value.data)) {
                                // @ts-ignore
                                let dg = value.data as NewDataGroup
                                let key = props.path.value[props.path.value.length - 1]

                                // setLoadedPatchSummary(dg.summary[key])
                            }
                        })

                    }
                }
            }
        } else {
        }
        if (!showSummary) {
            setLoadedPatchSummary({})
        }

    }, [`${currentPath}`, props.dataset,
        // loadedDataset?.date,
        JSON.stringify(selectTable)])


    useEffect(() => {
        // alert(`Mount! ${tableName}`)
    }, [])
    useEffect(() => {
        if (props.dataset !== tableName) {
            // alert(`${props.tableName} !== ${tableName}`)
            setTableName(props.dataset)
        }

    }, [props.dataset])

    useEffect(() => {
        fetchAvailablePatchVersions(props.dataset).then((data) => {
            props.onLoadedPatchesData(data)
        })

    }, [tableName])


    useEffect(() => {
        //Only do if dataset is actually changed, not on URL change
        // alert("fetch!")

        if (props.selectedPatchVersion) {
            fetchDataStaticDataset(props.dataset, props.selectedPatchVersion, props.lazyLoad).then((_data) => {

                //    Update sidebar
                if (_data) {
                    let defaultDataset: NewDataSetWithLabel = getDataset(_data.ds)

                    setLoadedDataSource(_data.ds)

                    let eloBrackets = getEloBrackets(_data.ds)
                    props.onLoadedEloBracketData(eloBrackets)
                    setDisableEloBracketPicker(!(eloBrackets !== null))


                    const getSideBarDatasetItemsForNewDataGroup = (groups: TTableGroup, parentKey: string) => {
                        let c: TSidebarItemCollection = Object.fromEntries(Object.keys(groups).map((k) => {

                            let item = groups.get(k)
                            let icon_data: IconData | undefined;
                            if (item?.meta_data?.hasOwnProperty("icon_data")) {
                                // @ts-ignore
                                icon_data = item.meta_data.icon_data;
                            }

                            return [k, {
                                label: `${item?.meta_data?.name}`,
                                iconData: icon_data,
                                key: k,
                                onClick: () => {
                                    setCurrentPath(["grouped_tables", parentKey, "samples", "All", "tableGroups", k])
                                },
                                // children:
                            }]
                        }));
                        return c
                    }

                    let sidebarDatasetItems: TSidebarItemCollection = Object.fromEntries(getGroupedTablesKeys(defaultDataset).map((k) => {
                        return [k, {
                            label: getLabelForDataItemType(k as DataItemType),
                            key: k,
                            onClick: () => {
                                setCurrentPath(["grouped_tables", k])
                            },
                            children: getSideBarDatasetItemsForNewDataGroup(getTableGroups(defaultDataset, k), k)
                            // children: getSideBarDatasetItemsForNewDataGroup(data.grouped_tables[k].samples["All"].tableGroups, k)
                        }]
                    }))
                    let topLevelItems = {...props.sidebarNavData.value.topLevelItems}
                    topLevelItems[props.dataset] = {
                        key: props.dataset,
                        label: props.dataset,
                        onClick(): void {
                            setCurrentPath([])
                        },
                        children: sidebarDatasetItems
                    }

                    topLevelItems["stats_views__players"] = {
                        key: "stats_views__players",
                        label: "Player Stats",
                        onClick(): void {
                            setCurrentPath(["stats_views__players"])
                        },
                        children: fixedPlayerInfoSidebarData()

                    }

                    props.sidebarNavData.set({
                        topLevelItems: topLevelItems,
                        datasetInfo: getDatasetInfo(defaultDataset)
                    })
                } else {
                    setLoadedDataSource(null)

                }
            })
        }
    }, [tableName, props.selectedPatchVersion])//, props.lazyLoad])

    useEffect(() => {

    }, [props.selectedEloBracket])

    const getSelectedDataviewForStaticDataset = (path: string[]) => {
        if (path.length === 0) {
            let dsType: DataModelType = "NewDataSet"
            return {data: selectedDataset, itemType: dsType}
        }

        // @ts-ignore
        let current: any = selectedDataset ? selectedDataset[path[0]] : null
        let i = 1
        while (current !== null && current !== undefined && i < path.length) {
            current = current[path[i]]
            i += 1
        }

        let itemType: DataModelType;

        if (current) {
            itemType = getDataModelType(current)
        }


        return {data: current ? current : null, itemType: itemType}
    }

    // TDataSourceContextDataView
    const getSelectedDataviewForDynamicDataset = (path: string[]) => {

        // 'http://127.0.0.1:8000/table_view/stats_views__players/197751'
        if (path.length === 1 && path[0] === "stats_views__players") {
            return new Promise<TDataSourceContextDataView>((resolve, reject) => {
                fetchPlayersTableWrappedIntoNewDataGroup({
                    start: paginationData.page * paginationData.rowsPerPage,
                    count: paginationData.rowsPerPage,

                }, serverSideSortData ? serverSideSortData : undefined, selectTable ? selectTable : undefined).then((data) => {
                    resolve({data: data, itemType: "NewDataGroup"})
                })
            });
        } else if (path.length === 3 && path[0] === "stats_views__players" && path[1] === "tableGroups") {
            return new Promise<TDataSourceContextDataView>((resolve, reject) => {
                fethPlayerProfileData(path[2]).then((data) => {
                    resolve({
                        data: data ? data.table : null,
                        metaData: data ? {
                            last_finished_job: data.last_finished_job,
                            scheduled_or_running_job: data.scheduled_or_running_job
                        } : undefined,
                        itemType: "NewDataTableGroupWithSummary"
                    })
                })
            });

        }
        return {data: null, itemType: undefined}
    }


    const getSelectedDataviewForDataset = (path: string[]) => {

        if (viewType === "stats_views__players") {
            setDisabledPatchPicker(true)

            return getSelectedDataviewForDynamicDataset(path)
        }
        setDisabledPatchPicker(false)


        // if (viewType === "static")
        return getSelectedDataviewForStaticDataset(path)

    }


    // if (props.dataset !== "EmpireWars_Stats") {
    //     return <Box><Typography>Dataset: {props.dataset} not found</Typography></Box>
    // }

    const selectTableServerside = (props: { table: "civ" | "map_type", key: string } | null) => {
        setSelectTable(props)
    }

    let getBaselineData: TBaselineTableGroupSampleDelegate | undefined = undefined;

    if (loadedDataSource && loadedDataSource.hasOwnProperty('dataset')) {
        getBaselineData = DatasetSplitByEloCollectionWithLabelBaselineProviderFactory("Elo", loadedDataSource as DatasetSplitByEloCollectionWithLabel)
    }

    const getDatasetKey = (path: string[], eloKey: string | null, patchKey: string | null) => {
        return `${path.join("")}-${eloKey}-${patchKey}`
    }

    return <DataProviderContext.Provider
        value={selectedDataset ? {
            datasetKey: getDatasetKey(props.path.value, props.selectedEloBracket, props.selectedPatchVersion),
            getBaselineData: getBaselineData,
            getSelectedDataView: () => {
                return getSelectedDataviewForDataset(currentPath)
            },
            path: {value: props.path.value, set: setCurrentPath},
            tableServerside: {select: selectTableServerside, value: selectTable},
            loadedPatchSummary: loadedPatchSummary,
            serversideSort: {
                sort: (by, asc) => {
                    // alert(`asc: ${asc}`)
                    setServerSideSortData({by: by, asc: asc})
                },
                sortBy: serverSideSortData.by,
                asc: !!serverSideSortData.asc
            },
            pagination: {
                page: paginationData.page,
                rowsPerPage: paginationData.rowsPerPage,
                setRowsPerPage: (p) => setPaginationData({...paginationData, rowsPerPage: p}),
                setPage: (p) => setPaginationData({...paginationData, page: p}),
            }
        } : null}>
        {/*<PrettyPathHeaderRenderer path={props.path.value}/>*/}
        {props.children}
    </DataProviderContext.Provider>
}

