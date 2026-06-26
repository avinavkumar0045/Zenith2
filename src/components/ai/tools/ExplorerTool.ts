import { ExplorerAPI } from '../api/ExplorerAPI';

export class ExplorerTool {
  public static execute(payload: { action: 'select' | 'search' | 'category' | 'reset'; value?: any }): string {
    switch (payload.action) {
      case 'select':
        if (payload.value) {
          ExplorerAPI.setSelectedObject(payload.value);
          const obj = ExplorerAPI.getObjectById(payload.value);
          return `Selected object in catalog: ${obj?.name ?? payload.value}.`;
        }
        ExplorerAPI.setSelectedObject(null);
        return `Cleared catalog selection.`;
      case 'search':
        const query = String(payload.value || '');
        ExplorerAPI.setSearchQuery(query);
        return `Catalog search filter set to: "${query}".`;
      case 'category':
        const cat = payload.value || 'all';
        ExplorerAPI.setCategory(cat);
        return `Catalog active category filtered to: "${cat}".`;
      case 'reset':
        ExplorerAPI.setSearchQuery('');
        ExplorerAPI.setCategory('all');
        ExplorerAPI.setSelectedObject(null);
        return `Reset catalog filters to default.`;
      default:
        return `Explorer tool command unhandled.`;
    }
  }
}
export default ExplorerTool;
