export const OrbitTheme = {
  // Mapping satellite categories to specific glowing CSS hex colors
  colors: {
    'weather': '#3b82f6', // Blue
    'stations': '#ffffff', // White (ISS)
    'visual': '#06b6d4', // Cyan
    'active': '#a855f7', // Purple
    'military': '#ef4444', // Red
    'default': '#f59e0b', // Amber
  },

  getColorForCategory(category: string): string {
    return this.colors[category as keyof typeof this.colors] || this.colors.default;
  }
};
