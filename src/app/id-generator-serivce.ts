import { DataSourceType } from './interfaces/data-source-type';
import { GlimpseId } from './interfaces/glimpse-id';

export class IdGeneratorService {
  public static getIdFromGlimpseId(glimpseId: GlimpseId) {
    if (glimpseId[0] === DataSourceType.Window) {
      return glimpseId[1] * -1;
    }
    return parseInt(glimpseId[1], 10);
  }
}
