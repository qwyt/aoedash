import {
    DatasetSplitByEloCollection,
    LazyLoadPath,
    MetaData,
    NewDataGroup, NewDataSample,
    NewDataSet,
    NewDataTableGroupWithSummary,
    PlayerMetaData,
    ViewRequestData
} from "./ModelGenerated";

//Keep in sync with 'StaticTableNames' in the backend
export type TStatsTableNames = "EmpireWars_Stats" | "RM_Stats"


export type DataModelType = undefined | "NewDataTableGroupWithSummary" | "NewDataGroup" | "NewDataSet"

// Dict[str, NewDataTableGroupWithSummary]

export type TEloBracket = "All" | "<950" | "950 - 1200" | "1200 - 1600" | ">1600"

export type DataItemType = undefined | "civ" | "map_type" | "rating_bin" | "profile_id" | "map_type_nested"

export const getEloBracketForElo = (elo: number) => {

    if (elo > 1600) {
        return ">1600";
    }
    if (elo > 1200) {
        return "1200 - 1600";
    }
    if (elo > 950) {
        return "950 - 1200";
    }
    if (elo > 0) {
        return "<950";
    }
    return "All"
}

const isNewDataTableGroupWithSummary = (obj: any) => {
    if (typeof obj === 'object') {
        //         n: number
        //      win_rate: number;
        // prop: number;
        // lazyLoadPath?: LazyLoadPath;
        // meta_data?: MetaData | PlayerMetaData;
        // tables?: {

        if (obj.hasOwnProperty("n")) {
            if (obj.hasOwnProperty("win_rate")) {
                if (obj.hasOwnProperty("prop")) {
                    if (obj.hasOwnProperty("meta_data") || obj.hasOwnProperty("tables")) {
                        return true;
                    }
                }
            }
        }
    }
    return false
}

export const isNewDataGroup = (obj: any) => {
    if (typeof obj === 'object') {
        if (obj.hasOwnProperty("name") && obj.hasOwnProperty("size") && obj.hasOwnProperty("samples")) {

            if (Object.keys(obj["samples"]).length > 0) {
                let items: any = Object.values(obj["samples"]["All"]["tableGroups"]);
                let item = items[0];

                return isNewDataTableGroupWithSummary(item)
            }
        }
    }
    return false
}

export const getDataModelType: (obj: any) => DataModelType = (obj) => {

    if (isNewDataTableGroupWithSummary(obj)) {
        return "NewDataTableGroupWithSummary"
    } else if (isNewDataGroup(obj)) {
        return "NewDataGroup"
    }
    return undefined;
}


export interface NewDataSetWithLabel extends Omit<NewDataSet, "grouped_tables"> {
    label: string,
    grouped_tables: {
        [k: string]: NewDataGroupWithLabel;
    };
}

export interface DatasetSplitByEloCollectionWithLabel extends Omit<DatasetSplitByEloCollection, "dataset"> {
    label: string,
    dataset: {
        [k: string]: NewDataSetWithLabel;
    };

}

export type TableGroup = {
    [k: string]: NewDataTableGroupWithSummary
} & { get: (key: string) => NewDataTableGroupWithSummary }

export type TTableGroup = TableGroup | Map<string, NewDataTableGroupWithSummary>

export interface NewDataGroupWithLabel extends Omit<NewDataGroup, "samples"> {
    label: string
    // tableGroups: TTableGroup;
    samples: {
        [k: string]: NewDataSampleWithSummary;
    };

}

export interface NewDataSampleWithSummary extends Omit<NewDataSample, "tableGroups"> {
    tableGroups: TTableGroup;
}


export interface NewDataGroupWithLabelPagedView extends NewDataGroupWithLabel {
    viewData: ViewRequestData
}

export const getLabelForDataItemType = (type: DataItemType) => {
    if (type === "civ")
        return "Civs"
    else if (type === "map_type")
        return "Maps"
    else if (type === "rating_bin")
        return "Elo Bracket"
    else if (type === "profile_id")
        return "Player"

    // @ts-ignore
    return type ? type.toString() : "MISSING"
}

export const getTableGroups = (source: DatasetSplitByEloCollectionWithLabel | NewDataSetWithLabel, k: string) => {

    if (source.hasOwnProperty('DatasetSplitByEloCollection')) {

        let data = source as DatasetSplitByEloCollectionWithLabel
        return data.dataset["All"].grouped_tables[k].samples["All"].tableGroups

    } else {
        let data = source as NewDataSetWithLabel
        return data.grouped_tables[k].samples["All"].tableGroups
    }
}


export const getGroupedTablesKeys = (source: DatasetSplitByEloCollectionWithLabel | NewDataSetWithLabel) => {
    if (source.hasOwnProperty('DatasetSplitByEloCollection')) {
        let data = source as DatasetSplitByEloCollectionWithLabel
        return Object.keys(data.dataset["All"].grouped_tables)
    } else {
        let data = source as NewDataSetWithLabel
        return Object.keys(data.grouped_tables)
    }
}

export const getDatasetInfo = (source: DatasetSplitByEloCollectionWithLabel | NewDataSetWithLabel) => {
    if (source.hasOwnProperty('DatasetSplitByEloCollection')) {
        let data = source as DatasetSplitByEloCollectionWithLabel
        return {totalGames: -1, lastUpdated: new Date(2000, 1, 1).toDateString()}
    } else {
        let data = source as NewDataSetWithLabel
        return {totalGames: data.sample_count, lastUpdated: data.date}
    }
}


