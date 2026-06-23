import { ILayer } from './ILayer';

export abstract class BaseLayer implements ILayer {
  public id: string;
  public name: string;
  public isVisible: boolean = false;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  public abstract initialize(): void;

  public show(): void {
    if (this.isVisible) return;
    this.isVisible = true;
    this.onShow();
  }

  public hide(): void {
    if (!this.isVisible) return;
    this.isVisible = false;
    this.onHide();
  }

  public update(time?: any): void {
    if (!this.isVisible) return;
    this.onUpdate(time);
  }

  public abstract destroy(): void;

  /**
   * Implementation specific logic for showing the layer.
   */
  protected abstract onShow(): void;

  /**
   * Implementation specific logic for hiding the layer.
   */
  protected abstract onHide(): void;

  /**
   * Implementation specific logic for updating the layer.
   */
  protected abstract onUpdate(time?: any): void;
}
