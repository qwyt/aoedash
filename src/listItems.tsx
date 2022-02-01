import * as React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import LayersIcon from '@mui/icons-material/Layers';
import AssignmentIcon from '@mui/icons-material/Assignment';
import {Collapse, List, ListItemButton} from "@mui/material";
import {ExpandLess, ExpandMore, StarBorder} from "@mui/icons-material";


export const SecondaryListItems = () => {
    const [open, setOpen] = React.useState(false);

    const handleClick = () => {
        setOpen(!open);
    };

    return <div>
        <ListSubheader inset>Player Stats</ListSubheader>
        <ListItemButton onClick={handleClick}>
            <ListItemIcon>
                <AssignmentIcon/>
            </ListItemIcon>
            <ListItemText primary="All Players"/>
            {open ? <ExpandLess/> : <ExpandMore/>}
        </ListItemButton>
        <Collapse in={open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
                <ListItemButton sx={{pl: 4}}>
                    <ListItemIcon>
                        <StarBorder/>
                    </ListItemIcon>
                    <ListItemText primary="By Elo"/>
                </ListItemButton>
                <ListItemButton sx={{pl: 4}}>
                    <ListItemIcon>
                        <StarBorder/>
                    </ListItemIcon>
                    <ListItemText primary="???"/>
                </ListItemButton>
                <ListItemButton sx={{pl: 4}}>
                    <ListItemIcon>
                        <StarBorder/>
                    </ListItemIcon>
                    <ListItemText primary="111"/>
                </ListItemButton>
            </List>
        </Collapse>
        <ListItem button>
            <ListItemIcon>
                <AssignmentIcon/>
            </ListItemIcon>
            <ListItemText primary="Highlights"/>
        </ListItem>
        <ListItem button>
            <ListItemIcon>
                <AssignmentIcon/>
            </ListItemIcon>
            <ListItemText primary="Find a player"/>
        </ListItem>
    </div>
}
