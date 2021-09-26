import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'siteTrim' })
export class SiteTrimPipe implements PipeTransform {
  transform(site: string): string {
    if (site.length > 75) {
      return `${site.substring(0, 73)}...`;
    }
    return site;
  }
}
