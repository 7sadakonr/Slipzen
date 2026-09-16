// Simple module-level state for tracking the previous tab
let _lastNonAddTab = 'index';

export function setLastNonAddTab(tab: string) {
  _lastNonAddTab = tab;
}

export function getLastNonAddTab(): string {
  return _lastNonAddTab;
}
