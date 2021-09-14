import { GlimpseId } from './glimpse-id';

export interface DataSource {
  readonly glimpseId: GlimpseId;
  name: string;
}
