# Management Centre Frontend Documentation

## Project Overview
This is a modern frontend management application built with React and Vite, utilizing the latest frontend technologies and best practices. The application appears to be a comprehensive management system with features for monitoring, server management, inventory control, customer management, and analytics.

## Tech Stack
- **Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.1
- **Styling**: Tailwind CSS 3.4.10
- **UI Components**: shadcn/ui (based on Radix UI primitives)
- **Form Handling**: React Hook Form with zod validation
- **Routing**: React Router DOM 6.26.1
- **HTTP Client**: Axios 1.7.7
- **Date Handling**: date-fns
- **Charts**: Recharts 2.15.0
- **Icons**: Lucide React, Hugeicons
- **Toast Notifications**: Sonner
- **Development Tools**: ESLint, PostCSS, Autoprefixer

## Project Structure

### Root Directory
```
├── src/                  # Source code
├── public/              # Static assets
├── dist/               # Build output
├── node_modules/       # Dependencies
├── .vscode/           # VS Code configuration
└── Various config files (vite, tailwind, eslint, etc.)
```

### Source Code Organization (src/)
```
├── assets/            # Static assets like images
├── components/        # React components
│   ├── ui/           # Reusable UI components
│   ├── Admin/        # Admin-related components
│   ├── Analytics/    # Analytics components
│   ├── Customers/    # Customer management
│   ├── CustomizeSiteComponents/  # Site customization
│   ├── Inventory/    # Inventory management
│   ├── Monitoring/   # System monitoring
│   └── Servers/      # Server management
├── config/           # Configuration files
├── hooks/            # Custom React hooks
├── lib/             # Utility libraries
├── pages/           # Route pages
└── utils/           # Utility functions
```

### Key Components
- `App.jsx`: Main application component
- `Dashboard.jsx`: Main dashboard view
- `NewDashboard.jsx`: Updated dashboard implementation
- `CustomizeSite.jsx`: Site customization interface
- `Preview.jsx`: Preview functionality

### Features
1. **Admin Management**
   - User management
   - Role-based access control

2. **Analytics**
   - Data visualization
   - Reporting tools
   - Charts and graphs using Recharts

3. **Customer Management**
   - Customer data handling
   - Customer interactions

4. **Site Customization**
   - UI/UX customization
   - Theme management
   - Layout configuration

5. **Inventory Management**
   - Stock tracking
   - Inventory analytics

6. **Monitoring**
   - System monitoring
   - Performance tracking
   - Alert systems

7. **Server Management**
   - Server status
   - Server configuration
   - Deployment management

## Environment Configuration
The application uses environment variables for configuration:
```
# Sample from envsample
#VITE_PORT=5178
```

## Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## UI Components
The application uses a comprehensive set of shadcn/ui components built on Radix UI primitives, located in `src/components/ui/`. These components include:

### Input Components
- `input.jsx` - Text input fields
- `textarea.jsx` - Multi-line text input
- `select.jsx` - Dropdown selection
- `checkbox.jsx` - Checkboxes
- `radio-group.jsx` - Radio button groups
- `switch.jsx` - Toggle switches
- `slider.jsx` - Range sliders
- `input-otp.jsx` - One-time password input

### Navigation Components
- `navigation-menu.jsx` - Main navigation
- `menubar.jsx` - Application menu
- `breadcrumb.jsx` - Breadcrumb navigation
- `pagination.jsx` - Page navigation
- `sidebar.jsx` - Sidebar navigation

### Layout Components
- `accordion.jsx` - Collapsible content
- `aspect-ratio.jsx` - Maintain aspect ratios
- `card.jsx` - Content containers
- `dialog.jsx` - Modal dialogs
- `drawer.jsx` - Side panels
- `sheet.jsx` - Overlay panels
- `resizable.jsx` - Resizable containers
- `scroll-area.jsx` - Scrollable containers
- `separator.jsx` - Visual dividers

### Data Display
- `table.jsx` - Data tables
- `chart.jsx` - Data visualization
- `carousel.jsx` - Image/content sliders
- `progress.jsx` - Progress indicators
- `avatar.jsx` - User avatars
- `badge.jsx` - Status indicators

### Feedback Components
- `alert.jsx` - Alert messages
- `alert-dialog.jsx` - Confirmation dialogs
- `toast.jsx` - Toast notifications
- `toaster.jsx` - Toast container
- `skeleton.jsx` - Loading states

### Interactive Components
- `button.jsx` - Various button styles
- `dropdown-menu.jsx` - Dropdown menus
- `context-menu.jsx` - Right-click menus
- `hover-card.jsx` - Hover information
- `tooltip.jsx` - Tooltips
- `command.jsx` - Command palette
- `form.jsx` - Form handling

### Date & Time
- `calendar.jsx` - Date picker

Each component is built with:
- Accessibility in mind (ARIA attributes)
- Responsive design
- Customizable styling through Tailwind CSS
- Type safety
- Proper keyboard navigation
- Touch device support

## Styling
- Tailwind CSS for utility-first styling
- CSS animations through tailwindcss-animate
- Custom theme support via next-themes
- Class variance authority for component variants

## Data Management
- React Hook Form for form handling
- Zod for validation
- Axios for API requests

## Routing
React Router DOM handles client-side routing with the following main routes:
- `/` - Main dashboard
- `/servers` - Server management
- `/analytics` - Analytics dashboard
- `/monitoring` - System monitoring
- `/pos-admins` - POS administration
- `/customers` - Customer management
- `/inventory` - Inventory management

Each route is currently configured to render the Dashboard component, suggesting a single-page application architecture with dynamic content loading based on the current route.

### Route Components
Each route has a corresponding page component in the `src/pages` directory:
- `monitoring.js`
- `pos-admins.js`
- `servers.js`
- `analytics.js`
- `customers.js`
- `inventory.js`

## Deployment
The project supports multiple deployment platforms:
- Vercel (vercel.json configuration)
- Netlify (netlify.toml configuration)

## Best Practices
1. Component organization by feature/domain
2. Consistent file naming conventions
3. Separation of concerns
4. Reusable UI components
5. Modern React patterns (hooks, context)
6. Type safety through proper validation
7. Responsive design
8. Performance optimization

## Future Considerations
1. TypeScript migration potential
2. Test implementation
3. CI/CD pipeline setup
4. Performance monitoring
5. Analytics integration
6. Accessibility improvements

## Utility Functions
The application includes utility functions in the `src/lib` directory:

### Class Name Utilities
`utils.js` provides a `cn()` function that combines:
- `clsx` for conditional class name joining
- `tailwind-merge` for Tailwind CSS class deduplication and merging

This utility is essential for:
- Dynamic class name generation
- Efficient Tailwind CSS usage
- Preventing class conflicts
- Maintaining clean component styling

---

*Note: This documentation is based on the current state of the codebase and should be updated as the project evolves.* 