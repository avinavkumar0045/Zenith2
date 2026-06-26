import { useCelestialExplorerStore } from '@/components/workspaces/celestial-explorer/CelestialExplorer.types';
import { ExplorerEngine } from '@/components/workspaces/celestial-explorer/engine/ExplorerEngine';
import { ExplorerObject, ExplorerCategory } from '@/components/workspaces/celestial-explorer/CelestialExplorer.types';

export class ExplorerAPI {
  public static getObjects(): ExplorerObject[] {
    return ExplorerEngine.compileRawObjects();
  }

  public static getObjectById(id: string): ExplorerObject | null {
    const list = this.getObjects();
    return list.find(o => o.id === id || o.id.includes(id) || id.includes(o.id)) ?? null;
  }

  public static findByName(name: string): ExplorerObject | null {
    const list = this.getObjects();
    const query = name.toLowerCase().trim();
    return list.find(o => o.name.toLowerCase().includes(query)) ?? null;
  }

  public static setSelectedObject(id: string | null) {
    useCelestialExplorerStore.getState().setSelectedObjectId(id);
  }

  public static getSelectedObjectId(): string | null {
    return useCelestialExplorerStore.getState().selectedObjectId;
  }

  public static setSearchQuery(query: string) {
    useCelestialExplorerStore.getState().setSearchQuery(query);
  }

  public static setCategory(category: ExplorerCategory | 'all') {
    useCelestialExplorerStore.getState().setActiveCategory(category);
  }
}
