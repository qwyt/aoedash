import * as React from 'react';
import {NewDataGroup, NewDataTableGroupWithSummary} from "../../Data/ModelGenerated";
import JSONTree from "react-json-tree";
import {Grid} from "@mui/material";

import {GridItem} from "./GridItem";
import {NewDataGroupWithLabel} from "../../Data/CheckType";
import {DataRendererExtensions, IPathObjectExtension} from "../DefaultDataRenderer";

export interface IGridViewProps {
    data: NewDataGroupWithLabel
}

export const OnSelectTopLevelGridItem = (val: string, current: string[], set: (v: string[]) => void) =>
    set([...current, "samples", "All", "tableGroups", val])

export function GridView(props: IGridViewProps & DataRendererExtensions & IPathObjectExtension) {

    let tableGroups = props.data.samples["All"].tableGroups;
    // @ts-ignore
    let sortedKeys = Object.keys(tableGroups).sort((a, b) => tableGroups[b].n - tableGroups[a].n)

    let gridItems: JSX.Element[] = sortedKeys.map(k => {
        let item = props.data.samples["All"].tableGroups.get(k) as unknown as NewDataTableGroupWithSummary
        // let item = props.data.tableGroups[k]
        return <GridItem
            onSelectItem={() => OnSelectTopLevelGridItem(k, props.path.value, props.path.set)}// props.path.set([...props.path.value, "samples", "All", "tableGroups", k])}
            data={item}/>
    })


    return <Grid container spacing={2}>
        {gridItems}
    </Grid>
}