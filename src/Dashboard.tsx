import * as React from 'react';
import {styled, createTheme, ThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar, {AppBarProps as MuiAppBarProps} from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import blue from '@mui/material/colors/blue';
import red from '@mui/material/colors/red';
import white from '@mui/material/colors/red';
import {AppSettingsContext} from "./App";
import {useTheme} from "styled-components";
import DropdownMenuPicker, {TDropdownMenuPickerValue} from "./Components/DropdownMenuPicker";
import {useEffect, useState} from "react";
import {MainContentView} from "./Components/MainContentView";
import {DataProvider} from "./Internal/DataProvider";
import {NewDataSet} from "./Data/ModelGenerated";
import {ISideBarNavData, Sidebar} from "./Components/Sidebar";
import {Route, BrowserRouter as Router, Switch, useHistory} from 'react-router-dom';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import SettingsIcon from '@mui/icons-material/Settings';
import {AppSettingsPanel} from "./Components/AppSettingsPanel";
import {TStatsTableNames} from "./Data/CheckType";
import {Stack, Tooltip} from "@mui/material";
import {InfoOutlined} from "@mui/icons-material";
import {DataSamplingMessage, DataSamplingMessageTooltip} from "./Components/DatasetSummary/DatasetSummaryViewRenderer";


// import "../public/index.css"


function Copyright(props: any) {
    return (
        <Box>
            <Box>
                <Grid container>
                    <Grid item md={6} lg={6} xl={6} xs={12}>
                        <Typography variant="body2" color="text.secondary" align="left" {...props}>
                            Total Matches Loaded: {props.datasetInfo.totalGames}
                        </Typography>
                    </Grid>
                    <Grid item md={6} lg={6} xl={6} xs={12}>
                        <Typography variant="body2" color="text.secondary" align="right" {...props}>
                            Dataset last updated: {props.datasetInfo.lastUpdated}
                        </Typography>
                    </Grid>
                </Grid>
            </Box>
            <Typography variant="body2" color="text.secondary" align="left" {...props}>
                Age of Empires II: HD© and Age of Empires II: Definitive Edition© Microsoft Corporation. This site was
                created under Microsoft's "Game Content Usage Rules" using assets from Age of Empires II: Definitive
                Edition, and it is not endorsed by or affiliated with Microsoft.
                {/*{'Copyright © '}*/}
                {/*<Link color="inherit" href="https://mui.com/">*/}
                {/*    Your Website*/}
                {/*</Link>{' '}*/}
                {/*{new Date().getFullYear()}*/}
                {/*{'.'}*/}
            </Typography>
        </Box>
    );
}

const drawerWidth: number = 220;

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({theme, open}) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    // ...(open && {
    //     marginLeft: drawerWidth,
    //     width: `calc(100% - ${drawerWidth}px)`,
    //     transition: theme.transitions.create(['width', 'margin'], {
    //         easing: theme.transitions.easing.sharp,
    //         duration: theme.transitions.duration.enteringScreen,
    //     }),
    // }),
}));
// sx={{
//   width: drawerWidth,
//   flexShrink: 0,
//   [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
// }}

const Drawer = styled(MuiDrawer, {shouldForwardProp: (prop) => prop !== 'open'})(
    ({theme, open}) => ({
        '& .MuiDrawer-paper': {
            position: 'relative',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            boxSizing: 'border-box',
            ...(!open && {
                overflowX: 'hidden',
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                width: theme.spacing(7),
                [theme.breakpoints.up('sm')]: {
                    width: theme.spacing(9),
                },
            }),
        },
    }),
);


// const mdTheme = createTheme({
//     palette: {
//         mode: "light",
//         primary: blue,
//         secondary: red
//     },
// });

function DashboardContent() {
    const [_open, setOpen] = React.useState(true);
    const toggleDrawer = () => {
        setOpen(!open);
    };
    const open = true
    // const colorMode = React.useContext(ColorModeContext);
    const theme: any = useTheme();
    const appSettings = React.useContext(AppSettingsContext);

    const setPathTo = (path: string) => {
        window.location.href = `/${path}`
    }


    const getInitialDataset = () => {

        let pathname = document.location.pathname
        let pathnameArr = pathname.split("/")
        let selectedDataset = "" as TStatsTableNames

        if (pathnameArr.length > 1) {
            selectedDataset = pathnameArr[1].replace("/", "") as TStatsTableNames
        }

        if (selectedDataset !== "EmpireWars_Stats" && selectedDataset !== "RM_Stats") {
            // setPathTo("RM_Stats")
        }
        return selectedDataset
    }

    const [selectedDataset, _dont_use] = useState<TStatsTableNames>(getInitialDataset());


    const setSelectedDataset = (v: TStatsTableNames, leavePath = false) => {

        if (v === selectedDataset) {
            return
        } else if (v === "EmpireWars_Stats" || v === "RM_Stats") {
            if (leavePath) {
                if (v === "EmpireWars_Stats") {
                    window.location.href = window.location.href.replace("RM_Stats", "EmpireWars_Stats")
                } else {
                    window.location.href = window.location.href.replace("EmpireWars_Stats", "RM_Stats")
                }
            } else {
                setPathTo(v)
                // window.location.href = `/${v}`
            }
        } else {
            setSelectedDataset("RM_Stats")
        }
    }

    //Disable patch and version picker when showing sample summary since it includes full dataset
    // const checkIfDisablePickers = () => {
    //     let path = window.location.href.split("/")
    //     return (path[path.length - 1] === "RM_Stats") || (path[path.length - 1] === "EmpireWars_Stats") ? "All" : undefined
    // }


    // const [selectedDataset, setSelectedDataset] = useState<TStatsTableNames>(getInitialDataset())


    const [selectedPatchFilter, setSelectedPatchFilter] = useState<string | null>(null)
    const [selectedEloBracketFilter, setSelectedEloBracketFilter] = useState<string | null>(null)

    const [availablePatchFilterValues, _setAvailablePatchFilterValues] = useState<TDropdownMenuPickerValue[]>([])
    const [availableEloBracketFilterValues, _setAvailableEloBracketFilterValues] = useState<TDropdownMenuPickerValue[]>([])

    const [_disabledPatchPicker, setDisabledPatchPicker] = useState(false)


    const [disabledDatasetPicker, setDisabledDatasetPicker] = useState(false)

    const [_disabledEloBracketPicker, setDisabledEloBracketPicker] = useState(false)

    // useEffect(() => {
    //     if (isSampleLevelPath()) {
    //         setDisabledEloBracketPicker(true);
    //         setDisabledPatchPicker(true)
    //     } else {
    //         if (disabledEloBracketPicker) {
    //             setDisabledEloBracketPicker(false)
    //         }
    //         if (disabledPatchPicker) {
    //             setDisabledPatchPicker(false)
    //         }
    //     }
    // }, [window.location.href])


    const [showSettingsPanel, setShowSettingsPanel] = useState(false)

    const [sidebarNavData, setSidebarNavData] = useState<ISideBarNavData>({
        datasetInfo: {
            lastUpdated: "",
            totalGames: 0
        }, topLevelItems: {}
    })

    let availableDatasets: TDropdownMenuPickerValue[] = [{
        label: "Empire Wars (1v1)",
        key: "EmpireWars_Stats"
    }, {
        label: "Random Map (1v1)",
        key: "RM_Stats",
        // disabled: true
    }]

    // let dummyEloFilters: TDropdownMenuPickerValue[] = [
    //     {
    //         label: "All",
    //         key: "0"
    //     },
    //
    //     {
    //         label: "<1000",
    //         key: "1"
    //     },
    //     {
    //         label: "1000-1200",
    //         key: "2"
    //     },
    //     {
    //         label: ">1200",
    //         key: "3"
    //     },
    //
    // ]
    // let history = useHistory();
    //
    // const setHistory = (pathStr: string) => {
    //     history.push(`/${pathStr}`)
    // }


    // @ts-ignore
    return (
        <Router>
            <Switch>
                {/*<Route path="/:datasetName/:groupName?/:itemName?" render={(props) =>*/}
                {/*  // @ts-ignore*/}
                <Route path="/*"
                    // @ts-ignore*/
                       render={(props: any) => {

                           const checkIfDisablePickers = () => {
                               let path = props.location.pathname.split("/")
                               return (path[path.length - 1] === "RM_Stats") || (path[path.length - 1] === "EmpireWars_Stats")
                           }

                           let disablePickers = checkIfDisablePickers();

                           const {disabledEloBracketPicker, disabledPatchPicker} = {
                               disabledEloBracketPicker: _disabledEloBracketPicker || disablePickers,
                               disabledPatchPicker: _disabledPatchPicker || disablePickers,
                           }

                           return <Box sx={{display: 'flex'}}>
                               <CssBaseline/>
                               <AppBar position="fixed" open={open}>
                                   <Toolbar
                                       sx={{
                                           justifyContent: "space-between",
                                           pr: '24px', // keep right padding when drawer closed
                                       }}
                                   >
                                       {/*<IconButton*/}
                                       {/*    edge="start"*/}
                                       {/*    color="inherit"*/}
                                       {/*    aria-label="open drawer"*/}
                                       {/*    onClick={toggleDrawer}*/}
                                       {/*    sx={{*/}
                                       {/*        marginRight: '36px',*/}
                                       {/*        ...(open && {display: 'none'}),*/}
                                       {/*    }}*/}
                                       {/*>*/}
                                       {/*    <MenuIcon/>*/}
                                       {/*</IconButton>*/}
                                       <Stack direction={"row"} spacing={1}>
                                           <img style={{marginLeft: "-15px"}} width={42}
                                                height={42}
                                                src={process.env.PUBLIC_URL + '/app_icon.png'}/>

                                           <Box
                                               className={"headerTitle"}
                                               // fontFamily={"TrajanusRoman"}
                                               // fontWeight={"700"}
                                           >
                                               AOE Stats Dashboard
                                           </Box>
                                       </Stack>
                                       {/*<Typography*/}
                                       {/*    className={"headerTitle"}*/}
                                       {/*    // fontFamily={"TrajanusRoman"}*/}
                                       {/*    // fontWeight={"700"}*/}
                                       {/*    component="h1"*/}
                                       {/*    variant="h6"*/}
                                       {/*    color="inherit"*/}
                                       {/*    noWrap*/}
                                       {/*    sx={{flexGrow: 1}}*/}
                                       {/*>*/}
                                       {/*    AOE Stats Dashboard*/}
                                       {/*</Typography>*/}

                                       <Stack direction={"row"} spacing={2}>
                                           {/*disabledPatchPicker: [{disabledPatchPicker.toString()}]*/}
                                           <DropdownMenuPicker
                                               value={"aoe2"}
                                               onChangeValue={() => {
                                               }}
                                               disabled={false}
                                               disabledLabel={disabledEloBracketPicker ? "All" : undefined}
                                               values={[{key: "aoe2", label: "AOE 2: DE", disabled: false},
                                                   {key: "aoe4", label: "AOE IV (WIP)", disabled: true}]}
                                               label={"Game"}/>

                                           <DropdownMenuPicker
                                               value={selectedEloBracketFilter === null ? "Loading..." : selectedEloBracketFilter}
                                               onChangeValue={setSelectedEloBracketFilter}
                                               disabled={disabledEloBracketPicker || availableEloBracketFilterValues.length === 0}
                                               disabledLabel={disabledEloBracketPicker ? "All" : undefined}

                                               values={availableEloBracketFilterValues}
                                               label={"Elo Bracket"}
                                               // dependencies={{check: window.location.href, disableOn: checkIfDisablePickers}}
                                           />

                                           <DropdownMenuPicker
                                               value={selectedPatchFilter === null ? "Loading..." : selectedPatchFilter}
                                               onChangeValue={setSelectedPatchFilter}
                                               disabled={disabledPatchPicker || availablePatchFilterValues.length === 0}
                                               disabledLabel={disabledPatchPicker ? "All" : undefined}
                                               values={availablePatchFilterValues}
                                               label={"Patch"}
                                               // dependencies={{check: window.location.href, disableOn: checkIfDisablePickers}}
                                           />

                                           <DropdownMenuPicker value={selectedDataset}
                                                               disabled={disabledDatasetPicker}
                                                               onChangeValue={(v) => {
                                                                   setSelectedDataset(v as TStatsTableNames, true);
                                                               }}
                                                               values={availableDatasets}
                                                               label={"Dataset"}/>

                                           <IconButton sx={{ml: 1}} onClick={() => {
                                               appSettings.toggleColorMode()
                                           }} color="inherit">
                                               {theme.palette.mode === 'dark' ? <Brightness7Icon/> :
                                                   <Brightness4Icon/>}
                                           </IconButton>

                                           <IconButton aria-describedby={"settings-panel"} sx={{ml: 1}}
                                                       onClick={() => {
                                                           setShowSettingsPanel(!showSettingsPanel)
                                                       }} color="inherit">
                                               {showSettingsPanel ? <SettingsApplicationsIcon/> : <SettingsIcon/>}
                                           </IconButton>
                                           <AppSettingsPanel id={'settings-panel'}
                                                             show={{
                                                                 value: showSettingsPanel,
                                                                 set: setShowSettingsPanel
                                                             }}/>
                                       </Stack>
                                   </Toolbar>
                               </AppBar>

                               <Sidebar data={sidebarNavData} as={Drawer} open={{value: open, toggle: toggleDrawer}}/>

                               {/*// <Drawer variant="permanent" open={open}>*/}
                               <Box
                                   component="main"
                                   sx={{
                                       backgroundColor: (theme) =>
                                           theme.palette.mode === 'light'
                                               ? theme.palette.grey[100]
                                               : theme.palette.grey[900],
                                       flexGrow: 1,
                                       height: '100vh',
                                       overflow: 'auto',
                                   }}>
                                   <Toolbar/>
                                   <Container
                                       id={"main-container"}
                                       // maxWidth="lg"
                                       maxWidth={false}
                                       sx={{mt: 4, mb: 4}}>
                                       <DataProvider
                                           selectedEloBracket={selectedEloBracketFilter}
                                           disabledEloBracketPicker={{
                                               value: disabledEloBracketPicker,
                                               set: setDisabledEloBracketPicker
                                           }}


                                           selectedPatchVersion={selectedPatchFilter}
                                           disabledPatchVersionPicker={{
                                               value: disabledPatchPicker,
                                               set: setDisabledPatchPicker
                                           }}

                                           dataset={selectedDataset}
                                           disabledDatasetPicker={{
                                               value: disabledDatasetPicker,
                                               set: setDisabledDatasetPicker
                                           }}


                                           onLoadedEloBracketData={(availableEloBrackets: string[] | null) => {
                                               if (availableEloBrackets) {
                                                   let options = availableEloBrackets.map((v) => {

                                                           return {
                                                               label: v,
                                                               key: v,
                                                               disabled: v === "All",
                                                               disabledLabel: v === "All" ?
                                                                   <Stack direction={"row"} justifyContent={"space-between"}
                                                                          width={"100%"}>
                                                                       {v}
                                                                       {/*// @ts-ignore*/}
                                                                       <DataSamplingMessageTooltip/>
                                                                       {/*<Tooltip arrow*/}
                                                                       {/*         style={{cursor: "help"}}*/}
                                                                       {/*         enterDelay={250}*/}
                                                                       {/*         title={<Box minWidth={"350px"}>{*/}
                                                                       {/*             <DataSamplingMessage alert/>}</Box>}>*/}
                                                                       {/*    <InfoOutlined/>*/}
                                                                       {/*</Tooltip>*/}
                                                                   </Stack>
                                                                   : undefined
                                                           }
                                                       }
                                                   );

                                                   // let latest = Math.max(...availablePatchVersion.map(v => Number(v)))

                                                   // options.forEach((opt) => {
                                                   //     if (opt.key === latest.toString()) {
                                                   //         opt.label = `Latest (${opt.label})`
                                                   //     }
                                                   // })

                                                   // options.push({label: latest.toString(), key: latest.toString()})
                                                   // @ts-ignore
                                                   _setAvailableEloBracketFilterValues(options)
                                                   setSelectedEloBracketFilter(">1600")

                                               }
                                           }}

                                           onLoadedPatchesData={(availablePatchVersions: { [version: string] : number }) => {

                                               let options = Object.keys(availablePatchVersions).map((version) => {
                                                       return {
                                                           label: version,
                                                           key: version,
                                                           n: availablePatchVersions[version],
                                                           subLabel: ""
                                                       }
                                                   }
                                               );

                                               let latest = Math.max(...Object.keys(availablePatchVersions).filter(k => availablePatchVersions[k] > 100000).map(v => Number(v)))

                                               if (isNaN(latest)){
                                                   latest = Math.max(...Object.keys(availablePatchVersions).map(v => Number(v)))
                                               }

                                               options.forEach((opt) => {
                                                   if (opt.key === latest.toString()) {
                                                       opt.subLabel = 'Latest'
                                                       // opt.label = `Latest (${opt.label})`
                                                   }
                                               })

                                               // options.push({label: latest.toString(), key: latest.toString()})
                                               _setAvailablePatchFilterValues(options)
                                               setSelectedPatchFilter(latest.toString())
                                           }}

                                           // viewType={"static"}
                                           lazyLoad={false}
                                           // tableName={"EmpireWars_Stats"}
                                           // @ts-ignore
                                           // tableName={props.match.params["0"].split("/")[0]}
                                           path={{
                                               value: (() => {
                                                   let path: string[] = [];//Object.values(props.match.params).map(v => v)


                                                   // @ts-ignore
                                                   path = props.match.params["0"].split("/")
                                                   // for (let i =0, i < Object.values(props.match.params))

                                                   // let path: string[] = []
                                                   // // [props.match.params.groupName, props.match.params.itemName]
                                                   // // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                                                   // props.match.params.groupName ? path.push(props.match.params.groupName) : 0
                                                   // // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                                                   // props.match.params.itemName ? path.push(props.match.params.itemName) : 0
                                                   // alert(`Path: ${path}`)
                                                   path = path.slice(1)
                                                   return path
                                               })(),
                                               set: (newPath) => {
                                                   let pathStr = "/" + newPath.join("/")
                                                   props.history.push(pathStr)
                                               }
                                           }}
                                           sidebarNavData={{value: sidebarNavData, set: setSidebarNavData}}>
                                           <MainContentView/>
                                       </DataProvider>
                                       {/*</Route>*/}
                                       {/*</Switch>*/}
                                       {/*<Grid container spacing={3}>*/}
                                       {/*    /!* Chart *!/*/}
                                       {/*    <Grid item xs={12} md={8} lg={9}>*/}
                                       {/*        <Paper*/}
                                       {/*            sx={{*/}
                                       {/*                p: 2,*/}
                                       {/*                display: 'flex',*/}
                                       {/*                flexDirection: 'column',*/}
                                       {/*                height: 240,*/}
                                       {/*            }}*/}
                                       {/*        >*/}
                                       {/*            <ItemHeaderDescription/>*/}
                                       {/*        </Paper>*/}
                                       {/*    </Grid>*/}
                                       {/*    /!* Recent Deposits *!/*/}
                                       {/*    <Grid item xs={12} md={4} lg={3}>*/}
                                       {/*        <Paper*/}
                                       {/*            sx={{*/}
                                       {/*                p: 2,*/}
                                       {/*                display: 'flex',*/}
                                       {/*                flexDirection: 'column',*/}
                                       {/*                height: 240,*/}
                                       {/*            }}*/}
                                       {/*        >*/}
                                       {/*            <ItemHeaderStats/>*/}
                                       {/*        </Paper>*/}
                                       {/*    </Grid>*/}
                                       {/*    /!* Recent Orders *!/*/}
                                       {/*    <Grid item xs={12}>*/}
                                       {/*        <Paper sx={{p: 2, display: 'flex', flexDirection: 'column'}}>*/}
                                       {/*            <DataTable/>*/}
                                       {/*        </Paper>*/}
                                       {/*    </Grid>*/}
                                       {/*</Grid>*/}
                                       <Copyright sx={{pt: 4}} datasetInfo={sidebarNavData.datasetInfo}/>
                                   </Container>
                               </Box>
                           </Box>
                       }
                       }/>
            </Switch>

        </Router>
    );
}

export default function Dashboard() {
    return <DashboardContent/>;
}
