import * as React from 'react';
import {useState} from 'react';
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListSubheader from "@mui/material/ListSubheader";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListItemText from "@mui/material/ListItemText";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PeopleIcon from "@mui/icons-material/People";
import {ExpandLess, ExpandMore} from "@mui/icons-material";
import {Box, Collapse, Icon, ListItemButton} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import {IconData} from "../Data/ModelGenerated";
import {ObjectIcon} from "../UI/ObjectIcon";


export type TSidebarItemCollection = { [key: string]: ISidebarItem }

export interface ISidebarItem {
    label: string;// | JSX.Element;
    key: string
    onClick: () => void,
    iconData?: IconData

    children?: TSidebarItemCollection
}

export interface ISideBarNavData {
    topLevelItems: TSidebarItemCollection

    datasetInfo: {
        totalGames: number,
        lastUpdated: string
    }
}

export interface ISidebarProps {

    //TODO don't pass full dataset, just top level names + urls instead

    data: ISideBarNavData
    as: any
    open: { value: boolean, toggle: () => void }
}

export const mainListItems = (
    <div>
        <ListSubheader inset>Aggregated Stats</ListSubheader>

        <ListItem button>
            <ListItemIcon>
                <DashboardIcon/>
            </ListItemIcon>
            <ListItemText primary="By Civ"/>
        </ListItem>
        <ListItem button>
            <ListItemIcon>
                <ShoppingCartIcon/>
            </ListItemIcon>
            <ListItemText primary="By Map"/>
        </ListItem>
        <ListItem button>
            <ListItemIcon>
                <PeopleIcon/>
            </ListItemIcon>
            <ListItemText primary="By Elo Range"/>
        </ListItem>
    </div>
);


export function Sidebar(props: ISidebarProps) {

    let [selectedItem, setSelectedItem] = useState<string | undefined>()
    let [childrenCollapseMap, setChildrenCollapseMap] = useState<{ [keyPath: string]: boolean }>({})

    const buildCollapsePath = (path: string[]) => {
        return path.join(".")
    }
    const setCollapse = (path: string, value: boolean) => {
        let cp = {...childrenCollapseMap}
        cp[path] = value
        setChildrenCollapseMap(cp)
    }

    const getChildrenCollapseMap = (path: string, level: number) => {

        let value = childrenCollapseMap[path]

        if (value === undefined && level == 0) {
            return true
        }
        return value
    }

    const renderListItem = (item: ISidebarItem, path: string[], level: number) => {
        let strPath = buildCollapsePath(path)

        let onClick = () => {
            setSelectedItem(strPath)
            item.onClick()
            // setSelectedItem(strPath)
        }
        let toggleCollapse = (ev: any) => {
            ev.stopPropagation();
            if (item.children) {
                let _open = getChildrenCollapseMap(buildCollapsePath(path), level)
                setCollapse(strPath, !_open)
            }
        }
        let pl = props.open.value ? 4 * level : 3;

        if (item.children && Object.keys(item.children).length > 0) {
            let open = getChildrenCollapseMap(buildCollapsePath(path), level)
            let expandButton = <IconButton>{open ? <ExpandLess onClick={toggleCollapse}/> :
                <ExpandMore onClick={toggleCollapse}/>}</IconButton>
            return <React.Fragment>
                <ListItemButton onClick={onClick} sx={{pl: pl}}
                                color={selectedItem === strPath ? "red" : undefined}>

                    <ListItemIcon>
                        {item.iconData ? <ObjectIcon data={item.iconData} borderless/> : open ? <FolderOpenIcon/> :
                            <FolderIcon/>}
                    </ListItemIcon>

                    {props.open.value &&
                        <ListItemText primary={item.label} color={selectedItem === strPath ? "red" : undefined}/>}

                    {props.open.value ? (expandButton) : undefined}
                </ListItemButton>
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding style={{overflowY: "scroll", maxHeight: "70vh"}}>
                        {/*// @ts-ignore */}
                        {Object.keys(item.children).map(key => renderListItem(item.children[key], [...path, key], level + 1))}
                    </List>
                </Collapse>
            </React.Fragment>

        } else {
            return <ListItemButton onClick={onClick} sx={{pl: pl}} selected={selectedItem === strPath}>
                <ListItemIcon>
                    {item.iconData ? <ObjectIcon data={item.iconData} borderless/> : <DashboardIcon/>}
                </ListItemIcon>
                {props.open.value && <ListItemText primary={`${item.label}`}/>}
            </ListItemButton>
        }
    }

    let mainListItems = Object.keys(props.data.topLevelItems).map((key) => renderListItem(props.data.topLevelItems[key], [key], 0))

    let Drawer = props.as;
    return <Drawer variant="permanent" open={props.open.value}>
        <Toolbar
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                // px:  [1],
            }}
        >


            <IconButton onClick={props.open.toggle}>
                <ChevronLeftIcon/>
            </IconButton>
        </Toolbar>
        <Divider/>
        {/*<div>selectedItem : {selectedItem}</div>*/}

        <Box marginLeft={"10px"}>
            <List>
                {/*<Box>*/}
                {mainListItems}
                {/*</Box>*/}
            </List></Box>
        <Divider/>
        {/*<List><SecondaryListItems/></List>*/}
    </Drawer>

}