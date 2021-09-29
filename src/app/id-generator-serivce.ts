import { DataSourceId } from './interfaces/data-source-id';
import { PageId } from './interfaces/page-id';

export class IdGeneratorService {
  // TODO: Change this
  public static getIdFromDataSourceIdOrPageId(id: DataSourceId | PageId) {
    return Math.floor(Math.random() * 1000 * 1000 * 1000);
  }
}
