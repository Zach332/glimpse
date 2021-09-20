import { DataSourceType } from './data-source-type';

export type GlimpseId = [DataSourceType.Window, number] | [DataSourceType.Folder, string];
