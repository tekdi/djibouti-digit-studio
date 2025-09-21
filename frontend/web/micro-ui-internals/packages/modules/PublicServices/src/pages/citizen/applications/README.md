# Citizen Applications Components

This folder contains the refactored `CitizenApplications` component broken down into smaller, reusable components.

## 📁 File Structure

```
applications/
├── index.js                 # Main component with data fetching logic
├── Header.js               # Header with search and filters
├── ApplicationCard.js      # Individual application card
├── ApplicationsGrid.js     # Grid container for application cards
├── EmptyState.js           # Empty state when no applications found
├── utils.js                # Helper functions and utilities
├── CitizenApplications.js  # Backward compatibility wrapper
└── README.md              # This documentation
```

## 🧩 Components

### `index.js` - Main Component
- **Purpose**: Main component that handles data fetching and state management
- **Features**: 
  - Fetches individual details and applications from API
  - Manages search and filter state
  - Combines all child components

### `Header.js` - Header Component
- **Purpose**: Displays page title, search bar, and filters
- **Props**:
  - `searchTerm`, `setSearchTerm` - Search functionality
  - `statusFilter`, `setStatusFilter` - Status filter
  - `businessServiceFilter`, `setBusinessServiceFilter` - Service filter
  - `businessServices` - Available services for filter
  - `onRefresh` - Refresh function

### `ApplicationCard.js` - Application Card
- **Purpose**: Displays individual application information
- **Props**:
  - `app` - Application data object
- **Features**:
  - Status badge with progress
  - Service information
  - Current and next step indicators
  - Creation date and location
  - "View Details" action button

### `ApplicationsGrid.js` - Grid Container
- **Purpose**: Renders the grid of application cards
- **Props**:
  - `applications` - Array of application objects
- **Features**:
  - Responsive grid layout (1-3 columns)
  - Handles empty state

### `EmptyState.js` - Empty State
- **Purpose**: Displays when no applications are found
- **Features**:
  - Centered layout with icon
  - Helpful message for users

### `utils.js` - Utilities
- **Purpose**: Contains all helper functions
- **Functions**:
  - `getServiceInfo()` - Service information mapping
  - `getServiceIcon()` - Service icon mapping
  - `getSimplifiedStatus()` - Status simplification
  - `getStatusInfo()` - Status display information
  - `formatDate()` - Date formatting
  - `statusOptions` - Status filter options

## 🔄 Backward Compatibility

The original `CitizenApplications.js` file now imports from this folder, maintaining backward compatibility with existing imports.

## 🎨 Styling

All components use Tailwind CSS classes and follow the project's design system:
- Primary color: `djibouti-primary` (#22a4d9)
- Hover states: `djibouti-primary-dark`
- Consistent spacing and border radius
- Responsive design

## 📱 Responsive Design

- **Mobile**: Single column layout
- **Tablet**: Two column layout
- **Desktop**: Three column layout

## 🔧 Usage

```javascript
// Import the main component
import CitizenApplications from './applications';

// Or import individual components
import Header from './applications/Header';
import ApplicationCard from './applications/ApplicationCard';
```

## 🚀 Benefits of Refactoring

1. **Maintainability**: Smaller, focused components
2. **Reusability**: Components can be used elsewhere
3. **Testing**: Easier to test individual components
4. **Performance**: Better code splitting and optimization
5. **Readability**: Clear separation of concerns
