//Model which were added manually due to issues in pydantic2ts
// (see ModelGenerated)


// see https://github.com/phillipdupuis/pydantic-to-typescript/issues/11
import {
    NewDataTableGroupWithSummary,
    PlayerStatsViewQueryJobInfo,
    PlayerStatsViewQueryResponse,
    ViewRequestData
} from "./ModelGenerated";

export interface TableGroupView {
    table: [string, NewDataTableGroupWithSummary][];
    viewData: ViewRequestData;
}

export type PlayerStatsViewQueryResponseMetaData = Omit<PlayerStatsViewQueryResponse, 'table'>

export type DataProviderResponseMetaData = PlayerStatsViewQueryResponseMetaData

// export interface NewDataTable {
//   n: number;
//   data: {
//     [k: string]: NewDataRow;
//   };
//   type: TableType;
//   win_rate: number;
//   prop: number;
//   additional_tables?: {
//     [k: string]: {
//       [k: string]: NewDataTable;
//     };
//   };
// }