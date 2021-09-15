import { GlimpseId } from './glimpse-id';

export interface Page {
  // TODO: Define this long type somewhere so it isn't repeated
  readonly glimpseId: GlimpseId;
  title: string;
  url: string;
  // TODO: Add favicon
  image: string | undefined;
}
