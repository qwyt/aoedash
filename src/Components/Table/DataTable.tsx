import * as React from 'react';
import {useEffect, useState} from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import SearchIcon from '@mui/icons-material/Search';
import styles from "./DataTable.module.scss"
import PersonIcon from '@mui/icons-material/Person';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import {
    Alert,
    Autocomplete,
    AutocompleteRenderInputParams,
    Badge,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    InputAdornment,
    TableFooter,
    TablePagination,
    TableSortLabel,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import {NewDataGroupWithLabel, NewDataGroupWithLabelPagedView} from "../../Data/CheckType";
import {GetObjOrMapKeys, propToPercent, roundToDec} from "../../Utils";
import {DataRendererExtensions, IPathObjectExtension, IViewInfoExtensions} from "../DefaultDataRenderer";
import {
    IconData,
    IconGroup,
    NewDataRow,
    NewDataTable,
    NewDataTableGroupWithSummary,
    PlayerTableNames,
    ViewRequestData
} from "../../Data/ModelGenerated";
import {ObjectIcon} from "../../UI/ObjectIcon";
import JSONTree from "react-json-tree";
import {StatsValueElement} from "../../UI/StatsValueElement";
import {DEFINES} from "../../Data/Defines";
import {LoadingButton} from "@mui/lab";
import {FindProfileForString, IFindProfileForStringResults} from "../../Internal/LiveAOE2NetInterface";
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import {END_POINTS_URL} from "../../Data/config";
import {DataTableWrapper} from "./DataTableWrapper";
import {OnSelectTopLevelGridItem} from "../Grid/GridView";

function preventDefault(event: React.MouseEvent) {
    event.preventDefault();
}

export interface IDataTableField {
    key: string | string[]
    label: string | JSX.Element
    type?: "int" | "prop" | "icon"
    description?: string
}

export interface IDataTableCellValue {
    value: string | number | undefined
    icon?: IconData
    link?: boolean
    hideValue?: boolean
    element?: JSX.Element
}

export interface IDataTableRow {

    id: string | number
    values: { [fieldKey: string]: IDataTableCellValue }
}

export interface IPaginationRequest {
    rowsPerPage: number
    page: number
    setPage: (p: number) => void;
    setRowsPerPage: (i: number) => void;
}

export interface ISortRequest {
    sort: (by: string | string[], asc?: boolean) => void
    sortBy: string | string[]
    asc: boolean
}


export interface IDataTableProps {
    data: {
        fields: { [key: string]: IDataTableField },
        rows: { [key: string]: IDataTableRow }
    }

    pagination?: IPaginationRequest
    serversideSort?: ISortRequest
    expanded?: boolean
}

interface MatchListPaginationActionsProps {
    count: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => void;

    // count?: number;
    // page: number;
    // rowsPerPage: number;
    // onPageChange: (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => void;
}

function DataTablePaginationActions(props: MatchListPaginationActionsProps) {
    // const classes = useStyles1();
    // const theme = useTheme();
    // const {count, page, rowsPerPage, onPageChange} = props;


    const count = props.count;
    const page = props.page;
    const rowsPerPage = props.rowsPerPage;
    const onPageChange = props.onPageChange;

    const handleFirstPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        onPageChange(event, 0);
    };

    const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        onPageChange(event, page - 1);
    };

    const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        onPageChange(event, page + 1);
    };

    const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (count !== undefined)
            onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };

    return (
        <div className={styles.pagination}>
            <IconButton
                onClick={handleFirstPageButtonClick}
                disabled={page === 0}
                aria-label="first page"
            >
                <FirstPageIcon/>
            </IconButton>
            <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
                <KeyboardArrowLeft/>
            </IconButton>
            <IconButton
                onClick={handleNextButtonClick}
                disabled={count !== -1 && page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="next page"
            >
                <KeyboardArrowRight/>
            </IconButton>
            <IconButton
                onClick={handleLastPageButtonClick}
                disabled={count === -1 || page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="last page"
            >
                <LastPageIcon/>
            </IconButton>
        </div>
    );
}

//Used for registering new players to be tracked
function TrackNewPlayerDialog(props: { open: boolean, handleClose: () => void }) {

    const [trackPlayersCallback, setTrackPlayersCallback] = useState<undefined | true | any>(undefined);
    const [currentInputValue, setCurrentInputValue] = useState("")
    const [isLockedForSearchOp, setIsLockedForSearchOp] = useState(false)
    const [selectedPlayersSet, setSelectPlayersSet] = useState<Set<string>>(new Set<string>())

    const trackPlayers = (profile_ids: Set<string>) => {

        let table: PlayerTableNames = "stats_views__players_EW"

        let params = new URLSearchParams()
        for (let p of Array.from(profile_ids)) {
            params.append("profile_ids", p)
        }
        const URI = `${END_POINTS_URL}/trackPlayers/${table}/?${params.toString()}`
        fetch(URI, {method: 'GET'}).then(response => response.json())
            .then(jsonResponse => {
                setTrackPlayersCallback({uri: URI, jsonResponse})
            }).catch((err) => {
            setTrackPlayersCallback({uri: URI, error: err})
        })
    }


    // const [canConfirm, setCanConfirm] = useState(false)

    const canConfirm = selectedPlayersSet.size > 0 && trackPlayersCallback === undefined

    const handleConfirm = () => {
        setTrackPlayersCallback(true)
        trackPlayers(selectedPlayersSet)
    }


    const addSelectedPlayer = (profileId: string, remove: boolean) => {
        let set = new Set<string>(selectedPlayersSet)

        if (remove) {
            if (set.has(profileId)) {
                set.delete(profileId)
            }
        } else {
            set.add(profileId)
        }
        setSelectPlayersSet(set)
    }

    const [searchForProfileResults, setSearchForProfileResults] = useState<IFindProfileForStringResults | undefined>(undefined)

    const searchForProfiles = (inputString: string) => {
        setIsLockedForSearchOp(true)

        FindProfileForString(inputString).then((res) => {
            setSearchForProfileResults({possibleOptions: res})
            setIsLockedForSearchOp(false)
        })
    }

    const {open, handleClose} = props

    let dialogContent: JSX.Element
    if (trackPlayersCallback === true) {
        dialogContent = <CircularProgress/>
    } else if (trackPlayersCallback !== undefined) {

        if (trackPlayersCallback.jsonResponse.hasOwnProperty("building reports for")) {
            dialogContent = <div>
                Building reports for: {trackPlayersCallback.jsonResponse["building reports for"].map((p: any) =>
                <div>{p}</div>)}
            </div>
        } else {
            dialogContent = <div>
                <div>Error:</div>
                <JSONTree data={trackPlayersCallback}/></div>
        }
    } else {
        dialogContent = <React.Fragment>
            <DialogContentText>
                Enter a player Profile ID or Steam ID for whom you want to be included in the table.
                You can also input a space separated list to add multiple players.

                (The Profile ID can be found by going to aoe2.net and selecting a profile and copying the value from the
                URL,
                e.g. in https://aoe2.net/#profile-196240 "196240" is the id)
            </DialogContentText>
            <TextField
                value={currentInputValue}
                onChange={(v) => setCurrentInputValue(v.currentTarget.value)}
                autoFocus
                margin="dense"
                id="profile-id-list"
                label="Profile IDs"
                // type="email"
                fullWidth
                variant="standard"

                InputProps={{
                    endAdornment: currentInputValue.length > 0 ?
                        <InputAdornment position="end">

                            <LoadingButton
                                loading={isLockedForSearchOp}
                                onClick={() => {
                                    searchForProfiles(currentInputValue)
                                }}
                            >
                                <SearchIcon/>
                            </LoadingButton>
                        </InputAdornment> : undefined
                }}
            />

            {searchForProfileResults && searchForProfileResults.possibleOptions.find((res) => res.error == undefined) &&
                <span>Check to select</span>}
            {searchForProfileResults && searchForProfileResults.possibleOptions && searchForProfileResults.possibleOptions.map((res) => {

                if (res.error) {
                    return <Box sx={{marginTop: "5px"}}>
                        <Chip
                            icon={<PriorityHighIcon/>}
                            label={`Not Found (${res.key})`}
                            // onDelete={data.label === 'React' ? undefined : handleDelete(data)}
                        />
                    </Box>

                } else if (res.player) {
                    let isSelected = selectedPlayersSet.has(res.key)
                    return <Box sx={{marginTop: "5px"}}>
                        <Badge color="secondary" badgeContent={res.player?.elo}>
                            <Chip
                                icon={<PersonIcon/>}
                                color={isSelected ? "primary" : undefined}
                                label={`${res.player?.name}(${res.key})`}
                                onClick={() => {
                                    // alert(JSON.stringify(res))
                                }}
                                onDelete={() => {
                                    addSelectedPlayer(res.key, isSelected)

                                    // alert(JSON.stringify(res))
                                }}
                                deleteIcon={isSelected ? <ClearIcon/> : <CheckIcon/>}

                                // onDelete={data.label === 'React' ? undefined : handleDelete(data)}
                            />
                        </Badge>
                    </Box>
                }
            })}

        </React.Fragment>

    }

    return <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Track Profile Stats</DialogTitle>
        <DialogContent>
            {dialogContent}
        </DialogContent>
        <DialogActions>
            {trackPlayersCallback !== undefined &&
                <Button disabled={false} onClick={handleClose}>Close</Button>
            }
            {(trackPlayersCallback === undefined || trackPlayersCallback === true) &&
                <React.Fragment>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button disabled={!canConfirm} onClick={handleConfirm}>Add Players</Button>
                </React.Fragment>
            }
        </DialogActions>
    </Dialog>

}

// mainViewItem -> hide header and disable collapsing
export default function DataTable(props: { title?: string, mainViewItem?: boolean, useGlobalSelect: boolean } & IDataTableProps & DataRendererExtensions & IViewInfoExtensions & IPathObjectExtension) {

    const [_orderBy, _setOrderBy] = useState<string | undefined>('n')
    const [_order, _setOrder] = useState<'asc' | 'desc'>('desc')

    let order: 'asc' | 'desc';
    let orderBy: string | undefined;
    if (props.serversideSort !== undefined) {
        orderBy = typeof props.serversideSort.sortBy === 'string' ? props.serversideSort.sortBy : props.serversideSort.sortBy[0]

        order = props.serversideSort.asc ? 'asc' : 'desc'
        // alert(order)
    } else {
        orderBy = _orderBy
        order = _order
    }

    let [_compactView, setCompactView] = useState(false)

    // const compactView = props.compactView === undefined ? _compactView : props.compactView;
    const compactView = _compactView;


    useEffect(() => {
        // alert("Mount table")
    }, [])

    const handleRequestSort = (
        event: React.MouseEvent<unknown>,
        property: string,
    ) => {


        if (props.serversideSort !== undefined) {
            let asc = orderBy === property && !props.serversideSort.asc
            // alert(`[${orderBy}] == [${property}] = ${orderBy === property}`)

            props.serversideSort.sort(property, asc)
        } else {
            const isAsc = orderBy === property && order === 'asc';

            _setOrder(isAsc ? 'desc' : 'asc');
            _setOrderBy(property);
        }
    };

    const createSortHandler =
        (property: string) => (event: React.MouseEvent<unknown>) => {
            handleRequestSort(event, property);
        };

    let sortedRowsKeys: string[] = [];//props.data.rows

    if (orderBy === undefined) {
        sortedRowsKeys = Object.keys(props.data.rows)
    } else {
        sortedRowsKeys = Object.keys(props.data.rows).sort((a, b) => {

            // @ts-ignore
            let valA = props.data.rows[a].values[orderBy].value;
            // @ts-ignore
            let valB = props.data.rows[b].values[orderBy].value;

            if (typeof valA === "string" && typeof valB === "string") {
                return 0;
            } else if (Number.isFinite(valA) && Number.isFinite(valB)) {
                // @ts-ignore
                return order === "desc" ? valB - valA : valA - valB;
            } else {
                return 0;
            }
        })
    }
    // return (
    //     <React.Fragment>.
    //         <div style={{
    //             marginLeft: "0.75rem",
    //             marginRight: "0.5rem",
    //             display: "flex",
    //             justifyContent: "space-between",
    //             alignItems: "center"
    //         }}>
    //             {/*<Typography variant={"h6"} color="primary" gutterBottom>Whatver this Table (TODO start collapsed*/}
    //             {/*    (topN)*/}
    //             {/*</Typography>*/}
    //             <IconButton>
    //                 {React.createElement(expanded ? KeyboardArrowUpIcon : KeyboardArrowDownIcon, {
    //                     fontSize: "large",
    //                     onClick: toggleExpanded
    //                 })}
    //             </IconButton>
    //
    //         </div>
    let table = <Table size={compactView ? 'small' : 'medium'} aria-label="custom pagination a table">
        <TableHead>
            <TableRow>
                {/*<TableCell>Date</TableCell>*/}
                {/*<TableCell>Name</TableCell>*/}
                {/*<TableCell>Ship To</TableCell>*/}
                {/*<TableCell>Payment Method</TableCell>*/}
                {/*<TableCell align="right">Sale Amount</TableCell>*/}
                {Object.values(props.data.fields).map((f) => {
                    let key = typeof f.key === "string" ? f.key : f.key.join("->")
                    return <TableCell>
                        <TableSortLabel
                            title={"dassaddas"}
                            active={orderBy === key}
                            direction={orderBy === key ? order : 'asc'}
                            // onClick={createSortHandler(f.key)}
                            onClick={createSortHandler(key)}
                        >

                            {f.description === undefined ? f.label : undefined}
                            {f.description && <Tooltip title={f.description}><span>{f.label} </span></Tooltip>}

                        </TableSortLabel>
                    </TableCell>
                })}
            </TableRow>
        </TableHead>
        <TableBody>
            {sortedRowsKeys.map((key) => props.data.rows[key]).map((row) =>
                <TableRow key={row.id}>
                    {Object.keys(row.values).map((key) => {
                        let value: string | undefined | JSX.Element;
                        let isLink = row.values[key].link
                        let onClick: (() => void) | undefined;
                        if (isLink) {
                            onClick = () => {
                                if (props.useGlobalSelect) {
                                    OnSelectTopLevelGridItem(`${row.id}`, props.path.value, props.path.set)
                                } else {
                                    props.path.set([...props.path.value, "tableGroups", `${row.id}`])
                                }
                            }
                        }

                        if (!compactView && props.data.fields[key].type === "icon") {
                            let icon = row.values[key].icon;
                            if (icon) {
                                // if (props.compactView) {
                                //     // @ts-ignore
                                //     value = icon.description ? icon.description : row.values[key].value.toString();
                                // }
                                // else {
                                value = <Box sx={{display: "flex", alignItems: "center"}} onClick={onClick}>
                                    <ObjectIcon data={icon} borderless/>
                                    <Typography sx={{
                                        marginLeft: "1rem",
                                        color: isLink ? "primary.dark" : undefined
                                    }}>{row.values[key].value}</Typography>
                                </Box>
                                // }
                            }
                        }

                        if (value === undefined && isLink) {
                            value = <Typography onClick={onClick}
                                                sx={{
                                                    cursor: isLink ? "pointer" : undefined,
                                                    marginLeft: "1rem",
                                                    color: isLink ? "primary.dark" : undefined
                                                }}> {row.values[key].value} </Typography>
                        }

                        if (row.values[key].element !== undefined) {
                            value = <Box
                                sx={{}}>{row.values[key].element}{row.values[key].hideValue ? undefined : value}</Box>
                        }

                        if (value === undefined) {
                            if (Number.isFinite(row.values[key].value)) {
                                let numVal = Number(row.values[key].value)
                                if (props.data.fields[key].type === "prop")
                                    value = `${propToPercent(numVal)}%`
                                else if (props.data.fields[key].type === "int")
                                    value = Math.round(numVal).toString()
                                else
                                    value = roundToDec(numVal).toString()
                            } else {
                                // @ts-ignore
                                value = row.values[key].value
                            }
                        }


                        return <TableCell>{value}</TableCell>
                    })}
                </TableRow>
            )}

            {/*{!expanded &&*/}
            {/*<TableRow key={"expanded"}>*/}
            {/*    <Button>Click to Show All Items</Button>*/}
            {/*</TableRow>}*/}

        </TableBody>
        {props.pagination && <TableFooter>
            <TableRow>
                <TablePagination
                    rowsPerPageOptions={[10, 20, 50, 100]}
                    colSpan={3}
                    count={props.viewRequestData ? props.viewRequestData.totalItems : -1}
                    // count={props.pagination.totalItems === undefined ? -1 : props.pagination.totalItems}
                    rowsPerPage={props.pagination.rowsPerPage}
                    page={props.pagination.page}
                    SelectProps={{
                        inputProps: {'aria-label': 'rows per page'},
                        native: true,
                    }}
                    onPageChange={(ev, page) => {
                        props.pagination?.setPage(page)
                    }}
                    onRowsPerPageChange={(ev) => {
                        props.pagination?.setRowsPerPage(Number(ev.target.value))
                    }}
                    ActionsComponent={DataTablePaginationActions}
                />
            </TableRow>
        </TableFooter>}

    </Table>
    let filterComponents = <Box sx={{display: "flex", alignItems: "center"}}>
        {props.filterComponents}
        <IconButton disabled={false} sx={{marginLeft: "auto"}} onClick={() => {
            setCompactView(!compactView)
        }}>
            {compactView ? <ZoomOutIcon/> : <ZoomInIcon/>}
        </IconButton>
    </Box>

    // if (props.independent){
    //     return table
    // }
    // else {

    return <DataTableWrapper title={props.title ? props.title : props.viewInfo.title}
                             filterComponents={filterComponents}
                             mainViewItem={props.mainViewItem}
                             expanded={props.expanded}>
        {table}
    </DataTableWrapper>
    // }
}

export interface IDataTableForDataGroupsProps {
    data: (NewDataGroupWithLabel | NewDataGroupWithLabelPagedView) & { key: string }
}

export function DataTableForDataGroups(props: IDataTableForDataGroupsProps & DataRendererExtensions & IViewInfoExtensions & IPathObjectExtension) {

    // @ts-ignore
    let rows: { [key: string]: IDataTableRow } = {}
    GetObjOrMapKeys(props.data.samples["All"].tableGroups).forEach((key) => {

        let item = props.data.samples["All"].tableGroups.get(key) as unknown as NewDataTableGroupWithSummary
        rows[`kk_${key}`] = {
            id: key,
            values: {
                "name": {
                    value: item.meta_data?.name,
                    link: true,
                    // @ts-ignore
                    icon: (item.meta_data && item.meta_data.hasOwnProperty("icon_data")) ? item.meta_data.icon_data : undefined
                },
                "n": {value: item.n},
                "prop": {value: item.prop},
                "win_rate": {value: item.win_rate},
            }
        }
    })

    let data: IDataTableProps = {
        serversideSort: props.serversideSort,
        data: {
            fields: {
                "name": {
                    key: "name",
                    label: props.data.label,
                    type: "icon"

                },
                "n": {
                    key: "n",
                    label: "Total Games",
                    type: "int"
                },
                "prop": {
                    key: "prop",
                    label: "Play Rate",
                    type: "prop"
                },
                "win_rate": {
                    key: "win_rate",
                    label: "Win Rate",
                    type: "prop"
                }

            },
            rows: rows
        }
    }

    let viewData: ViewRequestData | undefined;
    if (props.data.hasOwnProperty("viewData")) {
        viewData = (props.data as NewDataGroupWithLabelPagedView).viewData
    }

    return <DataTable {...data}
                      useGlobalSelect={true}
                      dataKey={props.dataKey}

                      mainViewItem

                      path={props.path}
                      viewInfo={props.viewInfo}
                      viewRequestData={viewData}
                      compactView={props.compactView} pagination={props.pagination}/>
}

export interface IFilterMenuProps {
    disabled?: boolean
    value: null | string
    nullLabel: string
    options: { label: string, key: string }[]
    iconGroup: IconGroup
    onChange: (value: string | null) => void
}

const IconWithInputField = (props: IFilterMenuProps & { params: AutocompleteRenderInputParams }) => {
    return <Box sx={{display: "flex"}}>
        {/*{props.value && <ObjectIcon data={{group: props.iconGroup, key: props.value}} borderless/>}*/}
        <TextField {...props.params} label={props.nullLabel}> 1</TextField>
    </Box>
}

export function FilterMenu(props: IFilterMenuProps) {

    let defaultItem = props.options.find((o) => o.label === props.value)
    const [value, setValue] = useState(defaultItem)
    // const [inputValue, setInputValue] = useState(defaultItem ? defaultItem.label : undefined)

    return <div className={`${styles.filterButtonContainer}`}>
        <Autocomplete

            disabled={props.disabled}
            // inputValue={""}
            // inputValue={inputValue ? inputValue : ""}
            // value={[]}
            value={value ? [value] : []}

            // onInputChange={(ev, val) => {
            //     setInputValue(val)
            // }}
            onChange={(ev, val) => {

                if (val.length > 0) {
                    setValue(val[val.length - 1])
                    props.onChange(val[val.length - 1].label)
                } else {
                    setValue(undefined)
                    props.onChange(null)
                }

                // alert(JSON.stringify(val))
            }}
            multiple
            size={"small"}
            disablePortal
            // limitTags={1}
            // getOptionLabel={(option) => option.label}

            id={`filter-box${props.nullLabel}`}
            options={props.options}
            sx={{width: 300}}
            renderInput={(params) => <IconWithInputField {...props} params={params}/>}
            renderTags={options => {
                return (
                    options.map((option: { label: string, key: string } | null) => {
                            return <React.Fragment>
                                {option && <ObjectIcon data={{group: props.iconGroup, key: option.key}} borderless/>}
                                {option && option.label}
                            </React.Fragment>
                        }
                    ))

            }}

            renderOption={(renderProps, option: { label: string, key: string } | null) => {
                // return <React.Fragment>
                return <Box component="li" sx={{'& > img': {mr: 2, flexShrink: 0}}} {...renderProps}>
                    {option && <ObjectIcon data={{group: props.iconGroup, key: option.key}} borderless/>}
                    <Box sx={{width: "0.65rem"}}/>
                    {option && option.label}
                </Box>
                {/*</React.Fragment>*/
                }
            }}

        />

    </div>
    //     <Button
    //     className={`${props.value ? styles.on : styles.empty}`}
    //     color={props.value ? "primary" : "info"}
    //     size={"small"}
    //     aria-controls="12"
    //     aria-haspopup="true"
    //     aria-expanded={open ? 'true' : undefined}
    //     variant="outlined"
    //     disableElevation
    //     onClick={() => {
    //         setOpen(!open)
    //     }}
    //     endIcon={<KeyboardArrowDownIcon/>}
    // >{props.nullLabel}</Button>
    // </div>
}

export function DataTableForPlayersList(props: IDataTableForDataGroupsProps & DataRendererExtensions & IViewInfoExtensions & IPathObjectExtension) {


    const [showTrackNewPlayerDialog, setShowTrackNewPlayerDialog] = useState(false)


    const filterCiv = props.tableServerside?.value?.table === "civ" ? props.tableServerside?.value.key : null;//useState<string | null>(null)
    const filterMap = props.tableServerside?.value?.table === "map_type" ? props.tableServerside?.value.key : null

    const setFilterCiv = (value: string | null) => {
        if (props.tableServerside)
            props.tableServerside.select(value ? {table: "civ", key: value} : null)
    }

    const setFilterMap = (value: string | null) => {
        if (props.tableServerside)
            props.tableServerside.select(value ? {table: "map_type", key: value} : null)
    }


    // @ts-ignore
    let rows: { [key: string]: IDataTableRow } = {}
    GetObjOrMapKeys(props.data.samples["All"].tableGroups).forEach((key) => {

        let item = props.data.samples["All"].tableGroups.get(key) as unknown as NewDataTableGroupWithSummary

        rows[`kk_${key}`] = {
            id: key,
            values: {
                "name": {
                    value: item.meta_data?.name,
                    link: true,
                    // element: <JSONTree data={item.meta_data}/>
                    // @ts-ignore
                    element: item.meta_data.country ? <div>
                        {/*// @ts-ignore*/}
                        <img src={`https://www.countryflags.io/${item.meta_data.country}/flat/64.png`}
                            // @ts-ignore
                             alt={item.meta_data.country}/>
                    </div> : undefined


                },
                "n": {value: item.n},
                // "prop": {value: item.prop},
                // @ts-ignore
                'meta_data->highest_elo': {value: item.meta_data.highest_elo},
                // @ts-ignore
                'meta_data->latest_elo': {value: item.meta_data.latest_elo},
                // "win_rate": {value: item.win_rate},
                "win_rate": {
                    value: item.win_rate,
                },

            }
        }

        if (filterMap || filterCiv) {
            rows[`kk_${key}`].values["adjusted_elo"] = {
                // @ts-ignore
                value: item.n > 10 ? estimatePlayerMapElo(item.meta_data.latest_elo, item.win_rate) : 0,
                hideValue: true,
                element: item.n > 10 ? <StatsValueElement label={"Est. Map Elo"} unit={undefined}
                                                          dontShowProgress={true}
                        // @ts-ignore
                                                          value={Math.round(estimatePlayerMapElo(item.meta_data.latest_elo, item.win_rate))}
                                                          baseline={undefined}/> //TODO compare to player elo?
                    : <div/>


            }

            // rows[`kk_${key}`].values["adjusted_elo"] = {value: estimatePlayerMapElo(item.meta_data.latest_elo, item.win_rate)}
        }
    })

    let data: IDataTableProps = {
        serversideSort: props.serversideSort,
        data: {
            fields: {
                "name": {
                    key: "name",
                    label: props.data.label,
                    type: "icon"

                },
                "n": {
                    key: "n",
                    label: "Total Games",
                    type: "int"
                },
                'meta_data->latest_elo': {
                    key: ['meta_data', 'latest_elo'],
                    label: 'Latest Elo',
                    type: 'int'
                },
                'meta_data->highest_elo': {
                    key: ['meta_data', 'highest_elo'],
                    label: 'Highest Elo',
                    type: 'int'
                },
                // "prop": {
                //     key: "prop",
                //     label: "Play Rate",
                //     type: "prop"
                // },
                "win_rate": {
                    key: "win_rate",
                    label: "Win Rate",
                    type: "prop"
                }

            },
            rows: rows
        }
    }

    if (filterCiv || filterMap) {
        let type_label = filterCiv !== null ? "Civ" : "Map";
        data.data.fields["adjusted_elo"] = {
            key: "win_rate",
            // label: "Adj. Elo",
            type: "int",
            description: `Estimate of what player Elo should be to have an expected average 50% win rate for a given ${type_label.toLowerCase()}. \n (Assuming the player played all the matches their current ELO and calculated using the FIDE Elo formula, so a very rough estimate) `,
            label: `Est. ${type_label} Elo`,

        }
    }

    let viewData: ViewRequestData | undefined;
    if (props.data.hasOwnProperty("viewData")) {
        viewData = (props.data as NewDataGroupWithLabelPagedView).viewData
    }

    const buildOptions = () => {

    }

    let optionsCivs = Object.keys(DEFINES.civilizations).map(k => {
        // @ts-ignore
        return {label: DEFINES.civilizations[k]["name"], key: k}
    })
    let optionsMaps = Object.keys(DEFINES.maps).map(k => {
        // @ts-ignore
        return {label: DEFINES.maps[k], key: k}
    })


    let filterComponents = [
        <FilterMenu disabled={filterCiv !== null} onChange={setFilterMap} iconGroup={"maps"} options={optionsMaps}
                    value={filterMap} nullLabel={"Filter by Map"}/>,
        <FilterMenu disabled={filterMap !== null} onChange={setFilterCiv} iconGroup={"civilizations"}
                    options={optionsCivs} value={filterCiv} nullLabel={"Filter by Civ"}/>
    ]
    // return <JSONTree data={optionsCivs}/>
    return <div>
        <Alert severity="warning">
            <p> Please not that due capacity constraints stats are not precalculcated for all players automatically.</p>
            If you can't find a player <Button onClick={() => {
            setShowTrackNewPlayerDialog(true)
        }} color="secondary">Click Here</Button> to add them to the tracked player list.
        </Alert>
        <TrackNewPlayerDialog
            key={new Date().getTime()}
            open={showTrackNewPlayerDialog} handleClose={() => {
            setShowTrackNewPlayerDialog(false)
        }}/>
        <DataTable {...data}
                   dataKey={props.dataKey}
                   useGlobalSelect={false}
                   path={props.path}
                   viewInfo={props.viewInfo}
                   viewRequestData={viewData}
                   compactView={props.compactView} pagination={props.pagination}
                   filterComponents={filterComponents}
        />
    </div>
}


export interface IDataTableForNewNewDataTable {
    data: NewDataTable
    expanded?: boolean
}

export function DefaultDataTableForNewDataTable(props: { title?: string } & IDataTableForNewNewDataTable & DataRendererExtensions & IViewInfoExtensions & IPathObjectExtension) {

    // @ts-ignore
    let rows: { [key: string]: IDataTableRow } = {}
    Object.keys(props.data.data).forEach((key) => {

        let item: NewDataRow = props.data.data[key]
        rows[key] = {
            id: key,
            values: {
                "name": {
                    value: item.meta_data?.name,
                    // @ts-ignore
                    icon: (item.meta_data && item.meta_data.hasOwnProperty("icon_data")) ? item.meta_data.icon_data : undefined

                },
                "n": {value: item.n},
                "prop": {
                    value: item.prop,
                    hideValue: true,
                    element: <StatsValueElement label={"Play Rate"} unit={"%"} dontShowProgress={true}
                                                value={item.prop}
                                                baseline={item.baseline?.prop}/>

                },
                "win_rate": {
                    value: item.win_rate,
                    hideValue: true,
                    element: <StatsValueElement label={"Win Rate"} unit={"%"} dontShowProgress={true}
                                                value={item.win_rate}
                                                baseline={item.baseline?.win_rate}/>

                },
            }
        }
    })

    let data: IDataTableProps = {
        serversideSort: props.serversideSort,
        data: {
            fields: {
                "name": {
                    key: "name",
                    label: props.data.type,
                    type: "icon"
                },
                "n": {
                    key: "n",
                    label: "Total Games",
                    type: "int"
                },
                "prop": {
                    key: "prop",
                    label: "Play Rate",
                    type: "prop"
                },
                "win_rate": {
                    key: "win_rate",
                    label: "Win Rate",
                    type: "prop"
                }

            },
            rows: rows
        }
    }
    return <DataTable
        dataKey={props.dataKey}
        useGlobalSelect={true}
        // independent={props.independent}
        expanded={props.expanded}
        path={props.path}
        title={props.title}

        viewInfo={props.viewInfo}
        {...data}
        filterComponents={props.filterComponents}
        compactView={props.compactView}/>
}


//Basically by how much your Elo needs to increase/decrease to have a 50% win rate on the map
//y = x - (400 log(1/z - 1))/log(10) and x>0 and 1/(10^(x/400) + 1)<z<1/2
const estimatePlayerMapElo = (real_elo: number, win_rate: number) => {

    let z = win_rate;
    let x = real_elo;
    let i = 1
    let n = 1
    // let y = 0.43429 * (-2513.3 * i * n + 2.3026 * x - 400 * Math.log(1 / z - 1))

    let y = x - 173.718 * Math.log((1 / z) - 1)

    return y
    // return Math.round(real_elo * (1 + (win_rate - 0.5)))
}

export function MapDataTableForPlayer(props: IDataTableForNewNewDataTable & DataRendererExtensions & IViewInfoExtensions & IPathObjectExtension & { player_elo: number }) {
    let type_label = props.data.type === "civs_table" ? "Civ" : "Map"

    // @ts-ignore
    let rows: { [key: string]: IDataTableRow } = {}
    Object.keys(props.data.data).forEach((key) => {

        let item: NewDataRow = props.data.data[key]

        let baseline = item.baseline;

        if (!baseline) {
            if (props.getBaselineData && props.baselineEloBracket) {
                const table_key = props.data.type === "civs_table" ? "civ" : props.data.type === "maps_table" ? "map_type" : undefined

                if (table_key) {

                    let itemKey = item.meta_data.icon_data?.key
                    if (itemKey) {
                        //TODO this is retarded, figure out why is float instead of int is saved in IconData
                        let itemKeyParsed = Math.floor(Number(itemKey)).toString()
                        let baselineData = props.getBaselineData(itemKeyParsed, table_key)

                        let eloBracketData = baselineData.find((b) => {
                            return b.label === props.baselineEloBracket
                        });

                        if (!eloBracketData) {
                            eloBracketData = baselineData.find((b) => b.label === "All");
                        }

                        if (eloBracketData && eloBracketData.value) {
                            baseline = {
                                n: eloBracketData.value.n,
                                prop: eloBracketData.value.prop,
                                win_rate: eloBracketData.value.win_rate,
                                // @ts-ignore
                                label: `*(all players in  ${eloBracketData.label} Elo Bracket)`
                            }

                            //Special case, want win rate against civ not with, be carefully about chaging label
                            //since atm there is no other way to tell which table is player civs which is against civs
                            if (props.data.label === "Civs Played Against") {
                                // @ts-ignore
                                baseline.win_rate = 1 - baseline.win_rate;
                            }

                            if (props.data.type === "maps_table") {
                                baseline.win_rate = -1
                            }


                        }
                    }
                }
            }
        }

        rows[key] = {
            id: key,
            values: {
                "name": {
                    value: item.meta_data?.name,
                    // @ts-ignore
                    icon: (item.meta_data && item.meta_data.hasOwnProperty("icon_data")) ? item.meta_data.icon_data : undefined

                },
                "n": {value: item.n},
                "prop": {
                    value: item.prop,
                    hideValue: true,
                    element: <StatsValueElement label={"Play Rate"} unit={"%"} dontShowProgress={true}
                                                value={item.prop}
                                                baseline={baseline?.prop}
                                                baselineLabel={baseline?.label}
                    />

                },
                "win_rate": {
                    value: item.win_rate,
                    hideValue: true,
                    element: <StatsValueElement label={"Win Rate"} unit={"%"} dontShowProgress={true}
                                                value={item.win_rate}
                                                baseline={baseline?.win_rate}
                                                baselineLabel={baseline?.label}
                    />

                },
                "estimated_elo": {
                    value: item.n > 10 ? estimatePlayerMapElo(props.player_elo, item.win_rate) : 0,
                    hideValue: true,
                    element: item.n > 10 ? <StatsValueElement label={"Est. Map Elo"} unit={undefined}
                                                              dontShowProgress={true}
                                                              value={Math.round(estimatePlayerMapElo(props.player_elo, item.win_rate))}
                                                              baseline={undefined}/> //TODO compare to player elo?
                        : <div/>


                },
            }
        }
    })
    let data: IDataTableProps = {
        serversideSort: props.serversideSort,
        data: {
            fields: {
                "name": {
                    key: "name",
                    label: props.data.type,
                    type: "icon"
                },
                "n": {
                    key: "n",
                    label: "Total Games",
                    type: "int"
                },
                "prop": {
                    key: "prop",
                    label: "Play Rate",
                    type: "prop"
                },
                "win_rate": {
                    key: "win_rate",
                    label: "Win Rate",
                    type: "prop"
                },
                "estimated_elo": {
                    key: "estimated_elo",
                    description: `Estimate of what your Elo should be so for you to have an expected average 50% win rate for a given ${type_label.toLowerCase()}. \n (Assuming you played all the matches with your current ELO and calculated using the FIDE Elo formula, so a very rough estimate) `,
                    label: `Est. ${type_label} Elo`,
                    // {/*label: <React.Fragment><span>Est. Map Elo  </span>*/}
                    // {/*    <Tooltip title="Estimate of what your Elo should be to have an average 50% for a given map/civ.*/}
                    // {/*    \n (Calculated using the FIDE Elo formula) ">*/}
                    // {/*        <React.Fragment>*/}
                    // {/*            <InfoOutlinedIcon/>*/}player_elo
                    // {/*        </React.Fragment>*/}
                    // {/*    </Tooltip>*/}

                    // </React.Fragment>,
                    type: "int"
                }

            },
            rows: rows
        }
    }
    return <DataTable
        useGlobalSelect={true}
        dataKey={props.dataKey}
        expanded={props.expanded}
        path={props.path}

        viewInfo={props.viewInfo}
        {...data}
        compactView={props.compactView}/>
}