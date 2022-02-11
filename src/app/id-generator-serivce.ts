import { DataSourceId } from './interfaces/data-source-id';
import { DataSourceType } from './interfaces/data-source-type';
import { PageId } from './interfaces/page-id';

export class IdGeneratorService {
  public static getIdFromDataSourceId(dataSourceId: DataSourceId) {
    if (dataSourceId[0] === DataSourceType.Window) {
      return `${dataSourceId[1] * -1}`;
    }
    return dataSourceId[1];
  }

  public static getIdFromPageId(pageId: PageId) {
    if (pageId[0] === DataSourceType.Window) {
      return `${pageId[2] * -1}`;
    }
    return pageId[2];
  }
}
