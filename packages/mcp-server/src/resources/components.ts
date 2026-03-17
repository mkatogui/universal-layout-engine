/**
 * UDS Component Library Resource
 *
 * Provides access to all 43 Universal Design System components
 * with their variants, properties, and platform implementations.
 *
 * Component categories:
 * - Navigation (6): Button, Navbar, Sidebar, Tabs, Breadcrumb, Pagination
 * - Data Input (6): Input, Select, Checkbox, Radio, Toggle, DatePicker, FileUpload
 * - Data Display (8): Card, Table, Badge, Avatar, Tooltip, Stat, Skeleton, List
 * - Feedback (5): Alert, Toast, Modal, Progress, CommandPalette
 * - Layout (5): Hero, Accordion, Divider, Footer, DropdownMenu
 * - Composite (7): Pricing, Testimonial, FeatureCard, CodeBlock, Form, Stepper, Timeline
 */

interface ComponentVariant {
  name: string;
  props?: Record<string, unknown>;
  description?: string;
}

interface ComponentPlatform {
  web: string;
  ios: string;
  android: string;
}

interface UDSComponent {
  name: string;
  category: string;
  description: string;
  variants: ComponentVariant[];
  platforms: ComponentPlatform;
  tokens?: string[];
  a11yNotes?: string;
}

interface ComponentLibrary {
  version: string;
  components: UDSComponent[];
}

/**
 * Complete UDS component library definition
 */
const COMPONENT_DEFINITIONS: ComponentLibrary = {
  version: '1.0.0',
  components: [
    // Navigation Components
    {
      name: 'Button',
      category: 'Navigation',
      description: 'Interactive button element for triggering actions',
      variants: [
        { name: 'primary', description: 'Primary action button' },
        { name: 'secondary', description: 'Secondary action button' },
        { name: 'tertiary', description: 'Tertiary/ghost button' },
        { name: 'danger', description: 'Destructive action button' },
        { name: 'disabled', description: 'Disabled button state' },
      ],
      platforms: {
        web: 'Button (React/TypeScript)',
        ios: 'Button (SwiftUI)',
        android: 'Button (Compose)',
      },
      tokens: ['$color-brand', '$space-4', '$space-2', '$font-size-md'],
    },

    {
      name: 'Navbar',
      category: 'Navigation',
      description: 'Top navigation bar for page header',
      variants: [
        { name: 'default', description: 'Standard navbar' },
        { name: 'sticky', description: 'Sticky header navbar' },
      ],
      platforms: {
        web: 'Navbar (React)',
        ios: 'NavigationBar (SwiftUI)',
        android: 'TopAppBar (Compose)',
      },
    },

    {
      name: 'Sidebar',
      category: 'Navigation',
      description: 'Side navigation panel',
      variants: [
        { name: 'default', description: 'Standard sidebar' },
        { name: 'collapsible', description: 'Collapsible sidebar' },
      ],
      platforms: {
        web: 'Sidebar (React)',
        ios: 'Sidebar (SwiftUI)',
        android: 'NavigationDrawer (Compose)',
      },
    },

    {
      name: 'Tabs',
      category: 'Navigation',
      description: 'Tab navigation component',
      variants: [
        { name: 'default', description: 'Standard tabs' },
        { name: 'scrollable', description: 'Scrollable tabs' },
      ],
      platforms: {
        web: 'Tabs (React)',
        ios: 'TabView (SwiftUI)',
        android: 'TabRow (Compose)',
      },
    },

    {
      name: 'Breadcrumb',
      category: 'Navigation',
      description: 'Breadcrumb trail navigation',
      variants: [{ name: 'default', description: 'Standard breadcrumb' }],
      platforms: {
        web: 'Breadcrumb (React)',
        ios: 'Breadcrumb (SwiftUI)',
        android: 'Breadcrumb (Compose)',
      },
    },

    {
      name: 'Pagination',
      category: 'Navigation',
      description: 'Page navigation component',
      variants: [
        { name: 'default', description: 'Standard pagination' },
        { name: 'compact', description: 'Compact pagination' },
      ],
      platforms: {
        web: 'Pagination (React)',
        ios: 'Pagination (SwiftUI)',
        android: 'Pagination (Compose)',
      },
    },

    // Data Input Components
    {
      name: 'Input',
      category: 'Data Input',
      description: 'Text input field',
      variants: [
        { name: 'default', description: 'Standard input' },
        { name: 'focused', description: 'Focused state' },
        { name: 'error', description: 'Error state' },
        { name: 'disabled', description: 'Disabled state' },
      ],
      platforms: {
        web: 'Input (React)',
        ios: 'TextField (SwiftUI)',
        android: 'TextField (Compose)',
      },
      a11yNotes: 'Requires associated label via aria-label or aria-labelledby',
    },

    {
      name: 'Select',
      category: 'Data Input',
      description: 'Dropdown select component',
      variants: [
        { name: 'default', description: 'Standard select' },
        { name: 'multiple', description: 'Multi-select' },
      ],
      platforms: {
        web: 'Select (React)',
        ios: 'Picker (SwiftUI)',
        android: 'ExposedDropdownMenuBox (Compose)',
      },
    },

    {
      name: 'Checkbox',
      category: 'Data Input',
      description: 'Checkbox input control',
      variants: [
        { name: 'default', description: 'Standard checkbox' },
        { name: 'indeterminate', description: 'Indeterminate state' },
      ],
      platforms: {
        web: 'Checkbox (React)',
        ios: 'Toggle (SwiftUI)',
        android: 'Checkbox (Compose)',
      },
    },

    {
      name: 'Radio',
      category: 'Data Input',
      description: 'Radio button control',
      variants: [{ name: 'default', description: 'Standard radio button' }],
      platforms: {
        web: 'Radio (React)',
        ios: 'RadioButton (SwiftUI)',
        android: 'RadioButton (Compose)',
      },
    },

    {
      name: 'Toggle',
      category: 'Data Input',
      description: 'Toggle switch control',
      variants: [
        { name: 'default', description: 'Standard toggle' },
        { name: 'disabled', description: 'Disabled toggle' },
      ],
      platforms: {
        web: 'Toggle (React)',
        ios: 'Toggle (SwiftUI)',
        android: 'Switch (Compose)',
      },
    },

    {
      name: 'DatePicker',
      category: 'Data Input',
      description: 'Date selection component',
      variants: [
        { name: 'default', description: 'Standard date picker' },
        { name: 'range', description: 'Date range picker' },
      ],
      platforms: {
        web: 'DatePicker (React)',
        ios: 'DatePicker (SwiftUI)',
        android: 'DatePicker (Compose)',
      },
    },

    {
      name: 'FileUpload',
      category: 'Data Input',
      description: 'File upload component',
      variants: [
        { name: 'default', description: 'Standard file upload' },
        { name: 'multiple', description: 'Multiple file upload' },
        { name: 'drag-drop', description: 'Drag and drop upload' },
      ],
      platforms: {
        web: 'FileUpload (React)',
        ios: 'DocumentPickerViewController (SwiftUI)',
        android: 'DocumentPicker (Compose)',
      },
    },

    // Data Display Components
    {
      name: 'Card',
      category: 'Data Display',
      description: 'Card container for grouped content',
      variants: [
        { name: 'default', description: 'Standard card' },
        { name: 'elevated', description: 'Elevated card' },
        { name: 'outlined', description: 'Outlined card' },
      ],
      platforms: {
        web: 'Card (React)',
        ios: 'Card (SwiftUI)',
        android: 'Card (Compose)',
      },
    },

    {
      name: 'Table',
      category: 'Data Display',
      description: 'Data table component',
      variants: [
        { name: 'default', description: 'Standard table' },
        { name: 'sortable', description: 'Sortable table' },
        { name: 'paginated', description: 'Paginated table' },
      ],
      platforms: {
        web: 'DataTable (React)',
        ios: 'List (SwiftUI)',
        android: 'LazyColumn (Compose)',
      },
    },

    {
      name: 'Badge',
      category: 'Data Display',
      description: 'Badge/label component',
      variants: [
        { name: 'default', description: 'Standard badge' },
        { name: 'primary', description: 'Primary badge' },
        { name: 'success', description: 'Success badge' },
        { name: 'warning', description: 'Warning badge' },
        { name: 'error', description: 'Error badge' },
      ],
      platforms: {
        web: 'Badge (React)',
        ios: 'Badge (SwiftUI)',
        android: 'Badge (Compose)',
      },
    },

    {
      name: 'Avatar',
      category: 'Data Display',
      description: 'User avatar component',
      variants: [
        { name: 'default', description: 'Image avatar' },
        { name: 'initials', description: 'Text initials avatar' },
        { name: 'icon', description: 'Icon avatar' },
      ],
      platforms: {
        web: 'Avatar (React)',
        ios: 'Avatar (SwiftUI)',
        android: 'Avatar (Compose)',
      },
    },

    {
      name: 'Tooltip',
      category: 'Data Display',
      description: 'Tooltip information component',
      variants: [
        { name: 'default', description: 'Standard tooltip' },
        { name: 'dark', description: 'Dark theme tooltip' },
      ],
      platforms: {
        web: 'Tooltip (React)',
        ios: 'Popover (SwiftUI)',
        android: 'Tooltip (Compose)',
      },
    },

    {
      name: 'Stat',
      category: 'Data Display',
      description: 'Statistic display component',
      variants: [{ name: 'default', description: 'Standard stat display' }],
      platforms: {
        web: 'Stat (React)',
        ios: 'StatCard (SwiftUI)',
        android: 'StatCard (Compose)',
      },
    },

    {
      name: 'Skeleton',
      category: 'Data Display',
      description: 'Loading skeleton component',
      variants: [
        { name: 'text', description: 'Text skeleton' },
        { name: 'circle', description: 'Circle skeleton' },
        { name: 'rect', description: 'Rectangle skeleton' },
      ],
      platforms: {
        web: 'Skeleton (React)',
        ios: 'Skeleton (SwiftUI)',
        android: 'Skeleton (Compose)',
      },
    },

    // Feedback Components
    {
      name: 'Alert',
      category: 'Feedback',
      description: 'Alert message component',
      variants: [
        { name: 'info', description: 'Information alert' },
        { name: 'success', description: 'Success alert' },
        { name: 'warning', description: 'Warning alert' },
        { name: 'error', description: 'Error alert' },
      ],
      platforms: {
        web: 'Alert (React)',
        ios: 'Alert (SwiftUI)',
        android: 'Alert (Compose)',
      },
    },

    {
      name: 'Toast',
      category: 'Feedback',
      description: 'Toast notification component',
      variants: [
        { name: 'default', description: 'Standard toast' },
        { name: 'success', description: 'Success toast' },
        { name: 'error', description: 'Error toast' },
      ],
      platforms: {
        web: 'Toast (React)',
        ios: 'Toast (SwiftUI)',
        android: 'Snackbar (Compose)',
      },
    },

    {
      name: 'Modal',
      category: 'Feedback',
      description: 'Modal dialog component',
      variants: [
        { name: 'default', description: 'Standard modal' },
        { name: 'alert', description: 'Alert modal' },
        { name: 'confirmation', description: 'Confirmation modal' },
      ],
      platforms: {
        web: 'Modal (React)',
        ios: 'Sheet (SwiftUI)',
        android: 'Dialog (Compose)',
      },
    },

    {
      name: 'Progress',
      category: 'Feedback',
      description: 'Progress indicator component',
      variants: [
        { name: 'linear', description: 'Linear progress' },
        { name: 'circular', description: 'Circular progress' },
      ],
      platforms: {
        web: 'Progress (React)',
        ios: 'ProgressView (SwiftUI)',
        android: 'LinearProgressIndicator (Compose)',
      },
    },

    {
      name: 'CommandPalette',
      category: 'Feedback',
      description: 'Command palette/command menu',
      variants: [{ name: 'default', description: 'Standard command palette' }],
      platforms: {
        web: 'CommandPalette (React)',
        ios: 'SearchBar (SwiftUI)',
        android: 'SearchBar (Compose)',
      },
    },

    // Layout Components
    {
      name: 'Hero',
      category: 'Layout',
      description: 'Hero section component',
      variants: [
        { name: 'default', description: 'Standard hero' },
        { name: 'with-image', description: 'Hero with background image' },
      ],
      platforms: {
        web: 'Hero (React)',
        ios: 'Hero (SwiftUI)',
        android: 'Hero (Compose)',
      },
    },

    {
      name: 'Accordion',
      category: 'Layout',
      description: 'Accordion/collapsible section',
      variants: [
        { name: 'default', description: 'Standard accordion' },
        { name: 'single', description: 'Single open accordion' },
      ],
      platforms: {
        web: 'Accordion (React)',
        ios: 'Accordion (SwiftUI)',
        android: 'Accordion (Compose)',
      },
    },

    {
      name: 'Divider',
      category: 'Layout',
      description: 'Visual divider/separator',
      variants: [
        { name: 'horizontal', description: 'Horizontal divider' },
        { name: 'vertical', description: 'Vertical divider' },
      ],
      platforms: {
        web: 'Divider (React)',
        ios: 'Divider (SwiftUI)',
        android: 'Divider (Compose)',
      },
    },

    {
      name: 'Footer',
      category: 'Layout',
      description: 'Page footer component',
      variants: [
        { name: 'default', description: 'Standard footer' },
        { name: 'dark', description: 'Dark footer' },
      ],
      platforms: {
        web: 'Footer (React)',
        ios: 'Footer (SwiftUI)',
        android: 'Footer (Compose)',
      },
    },

    {
      name: 'DropdownMenu',
      category: 'Layout',
      description: 'Dropdown menu component',
      variants: [
        { name: 'default', description: 'Standard dropdown menu' },
        { name: 'nested', description: 'Nested dropdown menu' },
      ],
      platforms: {
        web: 'DropdownMenu (React)',
        ios: 'Menu (SwiftUI)',
        android: 'DropdownMenu (Compose)',
      },
    },

    // Composite Components
    {
      name: 'Pricing',
      category: 'Composite',
      description: 'Pricing table component',
      variants: [
        { name: 'default', description: 'Standard pricing table' },
        { name: 'cards', description: 'Pricing cards layout' },
      ],
      platforms: {
        web: 'PricingTable (React)',
        ios: 'PricingView (SwiftUI)',
        android: 'PricingLayout (Compose)',
      },
    },

    {
      name: 'Testimonial',
      category: 'Composite',
      description: 'Testimonial/review component',
      variants: [
        { name: 'default', description: 'Standard testimonial' },
        { name: 'carousel', description: 'Testimonial carousel' },
      ],
      platforms: {
        web: 'Testimonial (React)',
        ios: 'TestimonialCard (SwiftUI)',
        android: 'TestimonialCard (Compose)',
      },
    },

    {
      name: 'FeatureCard',
      category: 'Composite',
      description: 'Feature highlight card',
      variants: [
        { name: 'default', description: 'Standard feature card' },
        { name: 'with-icon', description: 'Feature card with icon' },
      ],
      platforms: {
        web: 'FeatureCard (React)',
        ios: 'FeatureCard (SwiftUI)',
        android: 'FeatureCard (Compose)',
      },
    },

    {
      name: 'CodeBlock',
      category: 'Composite',
      description: 'Code snippet component',
      variants: [
        { name: 'default', description: 'Standard code block' },
        { name: 'copy-button', description: 'Code block with copy button' },
      ],
      platforms: {
        web: 'CodeBlock (React)',
        ios: 'CodeBlock (SwiftUI)',
        android: 'CodeBlock (Compose)',
      },
    },

    {
      name: 'Form',
      category: 'Composite',
      description: 'Complete form component',
      variants: [
        { name: 'default', description: 'Standard form' },
        { name: 'multi-step', description: 'Multi-step form' },
      ],
      platforms: {
        web: 'Form (React)',
        ios: 'Form (SwiftUI)',
        android: 'Form (Compose)',
      },
    },

    {
      name: 'Stepper',
      category: 'Composite',
      description: 'Step indicator component',
      variants: [
        { name: 'default', description: 'Horizontal stepper' },
        { name: 'vertical', description: 'Vertical stepper' },
      ],
      platforms: {
        web: 'Stepper (React)',
        ios: 'Stepper (SwiftUI)',
        android: 'Stepper (Compose)',
      },
    },

    {
      name: 'Timeline',
      category: 'Composite',
      description: 'Timeline component',
      variants: [
        { name: 'horizontal', description: 'Horizontal timeline' },
        { name: 'vertical', description: 'Vertical timeline' },
      ],
      platforms: {
        web: 'Timeline (React)',
        ios: 'Timeline (SwiftUI)',
        android: 'Timeline (Compose)',
      },
    },
  ],
};

/**
 * Resource that provides component library definitions
 */
export const componentsResource = {
  uri: 'ule://components',
  name: 'UDS Components',
  description: 'Universal Design System component library',
  mimeType: 'application/json',
  async getContent(): Promise<string> {
    return JSON.stringify(COMPONENT_DEFINITIONS, null, 2);
  },
};
