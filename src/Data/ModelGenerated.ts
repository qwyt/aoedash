/* tslint:disable */
/* eslint-disable */
/**
/* This file was automatically generated from pydantic models by running pydantic2ts.
/* Do not modify it by hand - just update the pydantic models and then re-run the script
*/

export type IconGroup = "civilizations" | "maps" | "technologies" | "terrain" | "objects" | "none";
export type TableType =
  | "tech_table"
  | "strategies_table"
  | "elo_table"
  | "civs_table"
  | "maps_table"
  | "players_table"
  | "opponent_players_table"
  | "game_duration_dist_table"
  | "player_stats_quick_summary";
export type GenericTableType =
  | "generic_mds_table"
  | "generic_summary_game_date_count"
  | "generic_summary_elo_bracket_distribution"
  | "generic_summary_player_country_distribution";
export type BuildPlayerProfileQueryStatus = 0 | 1 | 2 | 10 | -1;
export type PlayerTableNames = "stats_views__players_EW" | "stats_views__players_RM";

export interface BaselineDataRow {
  n: number;
  prop: number;
  win_rate: number;
  label?: string;
}
export interface DataEntry {
  n: number;
  prop: number;
  win_rate: number;
  win_rate_change: number;
  prop_group?: number;
  count?: Stats;
  time?: Stats;
  meta_data?: MetaData;
}
export interface Stats {
  mean: number;
  q1: number;
  median: number;
  q3: number;
  sd: number;
  upper_fence: number;
  lower_fence: number;
  min: number;
  max: number;
}
export interface MetaData {
  name: string;
  icon_data?: IconData;
  desc?: DescData;
  is_hidden?: boolean;
  mandatory?: boolean;
}
export interface IconData {
  group: IconGroup;
  key: string;
  description?: string;
}
export interface DescData {
  group_name: string;
  group_icon: IconData;
}
export interface DataTable {
  data: {
    [k: string]: DataEntry;
  };
  type: TableType;
}
export interface Dataset {
  data: {
    [k: string]: SampleCollection;
  };
}
export interface SampleCollection {
  n: number;
  win_rate: number;
  type: string;
  data: {
    [k: string]: MatchSample;
  };
}
export interface MatchSample {
  type: string;
  name: string;
  key: string;
  size: number;
  prop: number;
  win_rate?: number;
  meta_data?: MetaData;
  mean_count?: number;
  mean_time?: number;
  last_elo?: number;
  tables?: {
    [k: string]: DataTable;
  };
  steam_id?: string;
  country?: string;
}
export interface DatasetSplitByEloCollection {
  key: string;
  dataset: {
    [k: string]: NewDataSet;
  };
  DatasetSplitByEloCollection?: boolean;
}
export interface NewDataSet {
  name: string;
  date: string;
  sample_count: number;
  grouped_tables: {
    [k: string]: NewDataGroup;
  };
  summary_stats: {
    [k: string]: GenericTable;
  };
}
export interface NewDataGroup {
  name: string;
  size: number;
  samples: {
    [k: string]: NewDataSample;
  };
  alt_view?: GenericTable;
}
export interface NewDataSample {
  name: string;
  size: number;
  tableGroups: {
    [k: string]: NewDataTableGroupWithSummary;
  };
}
export interface NewDataTableGroupWithSummary {
  n: number;
  win_rate: number;
  prop: number;
  lazyLoadPath?: LazyLoadPath;
  summary?: {
    [k: string]: SampleSummaryValue;
  };
  meta_data?: PlayerMetaData | MetaData;
  tables?: {
    [k: string]: NewDataTable | TableBytesWrapper | DescriptiveStatsTable | PlayerQuickStatsTable;
  };
}
export interface LazyLoadPath {
  table: string;
  key: string;
  path: string[];
}
export interface SampleSummaryValue {
  win_rate: number;
  play_rate: number;
  size: number;
}
export interface PlayerMetaData {
  name: string;
  names: string[];
  highest_elo: number;
  latest_elo: number;
  country?: string;
  profile_id: string;
}
export interface NewDataTable {
  n: number;
  data: {
    [k: string]: NewDataRow;
  };
  type: TableType;
  label: string;
  win_rate: number;
  prop: number;
  additional_tables?: {
    [k: string]: {
      [k: string]: NewDataTable | MissingValue;
    };
  };
}
export interface NewDataRow {
  n: number;
  prop: number;
  win_rate: number;
  meta_data: MetaData;
  elo_balance?: number;
  baseline?: BaselineDataRow;
}
export interface MissingValue {
  reason: string;
  meta_data?: MetaData;
}
export interface TableBytesWrapper {
  type: string;
  bytes: string;
}
export interface DescriptiveStatsTable {
  label: string;
  type: TableType;
  data_views: {
    [k: string]: DescriptiveStatsView | MissingValue;
  };
}
export interface DescriptiveStatsView {
  meta_data: MetaData;
  mean: DescriptiveStatsValue;
  median: DescriptiveStatsValue;
  min: DescriptiveStatsValue;
  max: DescriptiveStatsValue;
  q1: DescriptiveStatsValue;
  q3: DescriptiveStatsValue;
  count: DescriptiveStatsValue;
  x_values: (number | number)[];
  y_values: number[];
  filtered_views: {
    [k: string]: {
      [k: string]: DescriptiveStatsView | MissingValue;
    };
  };
}
export interface DescriptiveStatsValue {
  value: number;
  unit?: string;
  meta_data?: DescriptiveStatsValueMetaData;
}
export interface DescriptiveStatsValueMetaData {
  match_id?: string;
  desc?: string;
}
export interface PlayerQuickStatsTable {
  last100GamesData: DayEloDataPoint[];
  mostPlayedCivs: {
    [k: string]: ObjectQuickStatsData;
  };
  mostPlayedMaps: {
    [k: string]: ObjectQuickStatsData;
  };
  statsHighlights: string[];
  type?: TableType & string;
}
export interface DayEloDataPoint {
  date: string;
  closing_elo: number;
}
export interface ObjectQuickStatsData {
  key: string;
  label: string;
  n: number;
  prop: number;
  win_rate: number;
}
export interface GenericTable {
  n: number;
  data: {
    [k: string]:
      | NewDataRowXy
      | {
          [k: string]: NewDataRowY;
        };
  };
  bounds?: XYBounds;
  type: GenericTableType;
  label?: string;
  desc?: string;
}
export interface NewDataRowXy {
  n?: number;
  x: number;
  y: number;
  label: string;
}
export interface NewDataRowY {
  y: number;
  label?: string;
}
export interface XYBounds {
  x: ValBounds;
  y: ValBounds;
}
export interface ValBounds {
  min: number;
  max: number;
}
export interface DummyForEnum {
  job: PlayerStatsViewQueryJobInfo;
  table: PlayerTableNames;
}
export interface PlayerStatsViewQueryJobInfo {
  job_id: number;
  profile_id: number;
  created: string;
  last_updated: string;
  status: BuildPlayerProfileQueryStatus;
  data: {
    [k: string]: unknown;
  };
}
export interface EloBalance {
  won: number;
  lost: number;
}
export interface HashableBaseModel {}
export interface NewStatsViewsContainer {
  dataset: {
    [k: string]: NewDataSet | DatasetSplitByEloCollection;
  };
  key: string;
  model_version: number;
  date_created: string;
}
export interface NewTableGroupSummary {
  keys: {
    [k: string]: string;
  };
}
export interface PlayerStatsViewQueryResponse {
  last_finished_job?: PlayerStatsViewQueryJobInfo;
  scheduled_or_running_job?: PlayerStatsViewQueryJobInfo;
  table: NewDataTableGroupWithSummary;
}
export interface StatsHighlight {
  value: string;
}
export interface StatsViewsContainer {
  dataset: Dataset;
  key: string;
  model_version: number;
  date_created: string;
}
export interface StrategiesDataEntry {
  n: number;
  prop: number;
  win_rate: number;
  win_rate_change: number;
  prop_group?: number;
  count?: Stats;
  time?: Stats;
  meta_data?: MetaData;
}
export interface TechDataEntry {
  n: number;
  prop: number;
  win_rate: number;
  win_rate_change: number;
  prop_group?: number;
  count?: Stats;
  time?: Stats;
  meta_data?: MetaData;
}
export interface ViewRequestData {
  items: number;
  totalItems: number;
}
