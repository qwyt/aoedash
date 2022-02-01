// Custom function that return baseline values a given key, specific to load Datasource type and key


import {DatasetSplitByEloCollectionWithLabel} from "./CheckType";
import {NewDataTableGroupWithSummary} from "./ModelGenerated";


export type TBaselineTableGroupSample = { label: string, value: NewDataTableGroupWithSummary }[]
export type TBaselineTableGroupSampleDelegate = (itemKey: string, table: string) => TBaselineTableGroupSample

export type BaselineProvidersKeys = "Elo" | "All_Maps" | "All_Civs"
export const DatasetSplitByEloCollectionWithLabelBaselineProviderFactory = (key: BaselineProvidersKeys, ds: DatasetSplitByEloCollectionWithLabel) => {

    // if (key === "Elo") {
    let delegate: TBaselineTableGroupSampleDelegate = (itemKey: string, table: string) => {

        let eloKeys = Object.keys(ds.dataset)
        let items = eloKeys.map((k) => {
            let value = ds.dataset[k].grouped_tables[table].samples["All"].tableGroups.get(itemKey) as NewDataTableGroupWithSummary
            return {
                label: k,
                value: value
            }
        })
        return items;
    }
    return delegate
    // }


// Elo
// All_Maps
// All_Civs
}
