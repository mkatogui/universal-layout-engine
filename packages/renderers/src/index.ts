/**
 * Universal Layout Engine Renderers Package
 *
 * Provides multi-platform renderers that convert Intermediate Representation
 * (IR) layout nodes into platform-specific code:
 * - Web: React + TypeScript + UDS components
 * - iOS: SwiftUI
 * - Android: Jetpack Compose
 * - Desktop: React with desktop-specific optimizations
 */

// Web Renderer
export { WebRenderer } from './web/index.js';

// iOS Renderer
export { IosRenderer } from './ios/index.js';

// Android Renderer
export { AndroidRenderer } from './android/index.js';

// Desktop Renderer
export { DesktopRenderer } from './desktop/index.js';

/**
 * Create the appropriate renderer for a target platform.
 * Uses dynamic imports (ESM-compatible).
 */
export async function createRenderer(platform: 'web' | 'ios' | 'android' | 'desktop') {
  switch (platform) {
    case 'web': {
      const { WebRenderer } = await import('./web/index.js');
      return new WebRenderer();
    }
    case 'ios': {
      const { IosRenderer } = await import('./ios/index.js');
      return new IosRenderer();
    }
    case 'android': {
      const { AndroidRenderer } = await import('./android/index.js');
      return new AndroidRenderer();
    }
    case 'desktop': {
      const { DesktopRenderer } = await import('./desktop/index.js');
      return new DesktopRenderer();
    }
    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
}
