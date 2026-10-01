export type IconName =
  | 'x'
  | 'trash'
  | 'check'
  | 'bag'
  | 'package'
  | 'alert-triangle'
  | 'trending-up'
  | 'user'
  | 'file-text'
  | 'truck'
  | 'bar-chart'
  | 'search'
  | 'plus'
  | 'minus'
  | 'edit'
  | 'arrow-right'
  | 'clock'
  | 'map-pin';

/** Fragmentos SVG confiables (autoría propia, no entrada de usuario). */
export const ICON_PATHS: Record<IconName, string> = {
  x: '<line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/>',
  check: '<polyline points="5 13 10 18 19 7"/>',
  trash:
    '<line x1="4" y1="7" x2="20" y2="7"/><path d="M6 7 V20 a2 2 0 0 0 2 2 h8 a2 2 0 0 0 2 -2 V7"/><path d="M9 7 V4 a1 1 0 0 1 1 -1 h4 a1 1 0 0 1 1 1 V7"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
  bag: '<path d="M9 8 V6 a3 3 0 0 1 6 0 v2"/><rect x="5" y="8" width="14" height="12" rx="2"/>',
  package:
    '<rect x="3" y="8" width="18" height="13" rx="1"/><path d="M3 8 L12 3 L21 8"/><line x1="12" y1="3" x2="12" y2="21"/>',
  'alert-triangle':
    '<path d="M12 3 L22 20 H2 Z" stroke-linejoin="round"/><line x1="12" y1="9" x2="12" y2="14"/><circle cx="12" cy="17" r="0.8" fill="currentColor" stroke="none"/>',
  'trending-up': '<polyline points="3 17 9 11 13 15 21 6"/><polyline points="15 6 21 6 21 12"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21 C4 16.6 7.6 13 12 13 C16.4 13 20 16.6 20 21"/>',
  'file-text':
    '<path d="M6 2 H14 L19 7 V21 a1 1 0 0 1 -1 1 H6 a1 1 0 0 1 -1 -1 V3 a1 1 0 0 1 1 -1 Z"/><path d="M14 2 V7 H19"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>',
  truck:
    '<rect x="1" y="7" width="13" height="10" rx="1"/><path d="M14 10 H18 L21 13 V17 H14 Z"/><circle cx="6" cy="19" r="2"/><circle cx="17" cy="19" r="2"/>',
  'bar-chart':
    '<line x1="4" y1="20" x2="4" y2="10"/><line x1="10" y1="20" x2="10" y2="4"/><line x1="16" y1="20" x2="16" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>',
  search: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.2" y2="16.2"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  minus: '<line x1="5" y1="12" x2="19" y2="12"/>',
  'arrow-right': '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/>',
  clock: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>',
  'map-pin':
    '<path d="M12 21 C12 21 5 14.5 5 9.5 a7 7 0 0 1 14 0 C19 14.5 12 21 12 21 Z"/><circle cx="12" cy="9.5" r="2.5"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16v4Z"/><line x1="13.5" y1="6.5" x2="17.5" y2="10.5"/>',
};
