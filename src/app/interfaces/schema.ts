import { DBSchema } from 'idb';
import { GlimpseId } from './glimpse-id';

export interface Schema extends DBSchema {
  images: {
    key: GlimpseId;
    value: string;
  };
  names: {
    key: number;
    value: string;
  };
}
