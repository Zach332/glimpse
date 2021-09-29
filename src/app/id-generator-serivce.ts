import { DataSourceId } from './interfaces/data-source-id';
import { DataSourceType } from './interfaces/data-source-type';
import { PageId } from './interfaces/page-id';

export class IdGeneratorService {
  // TODO: Will all of these even be unique?
  public static getIdFromDataSourceIdOrPageId(id: DataSourceId | PageId) {
    if (id[0] === DataSourceType.Window) {
      return id[1] * -1;
    }
    return parseInt(id[1], 10);
  }
}
