import { RefObject } from 'react';

export class CommandIslandEvents {
  /**
   * Binds keyboard listener for the Escape key.
   * Returns a cleanup function.
   */
  public static bindEscapeKey(onEscape: () => void): () => void {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }

  /**
   * Binds document click/touch listener to detect click outside the element boundaries.
   * Returns a cleanup function.
   */
  public static bindClickOutside(
    containerRef: RefObject<HTMLElement | null>,
    onClickOutside: () => void
  ): () => void {
    const handleClick = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onClickOutside();
      }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }

  /**
   * Focuses the provided input element safely.
   */
  public static focusElement(ref: RefObject<HTMLInputElement | null>): void {
    if (ref.current) {
      ref.current.focus();
    }
  }
}
