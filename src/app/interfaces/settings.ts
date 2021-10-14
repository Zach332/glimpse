export interface Settings {
  pagePrevWidth: number;
  pagePrevCollapse: boolean;
  dragMode: 'copy' | 'move';
  selectedSidebarItems: Map<string, boolean>;
  windowExpanded: boolean;
  savedExpanded: boolean;
}
