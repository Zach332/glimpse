import { GlimpseId } from './glimpse-id';

export interface Page {
  readonly glimpseId: GlimpseId;
  title: string;
  url: string;
  // TODO: Add favicon
  image: string | undefined;
}
