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
 * Create the appropriate renderer for a target platform
 *
 * @param platform Target platform: 'web', 'ios', 'android', or 'desktop'
 * @returns Renderer instance for the specified platform
 * @throws Error if platform is not recognized
 */
export function createRenderer(platform: 'web' | 'ios' | 'android' | 'desktop') {
  switch (platform) {
    case 'web':
      return new (require('./web/index.js').WebRenderer)();
    case 'ios':
      return new (require('./ios/index.js').IosRenderer)();
    case 'android':
      return new (require('./android/index.js').AndroidRenderer)();
    case 'desktop':
      return new (require('./desktop/index.js').DesktopRenderer)();
    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
}
