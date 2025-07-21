# Agent Report Components

This directory contains the refactored agent report components with a clean, modular architecture.

## 📁 Structure

```
AgentReport/
├── components/
│   ├── FileUploadSection.js    # File upload with download/remove functionality
│   └── ModalHeader.js          # Modal header with edit functionality
├── hooks/
│   ├── useAgentReportAPI.js    # API calls for submit/download
│   ├── useAgentReportData.js   # Data fetching and state management
│   └── useAgentReportForm.js   # Form state and validation
├── AgentReportCard.js          # Main card component
├── AgentReportModal.js         # Main modal component
├── index.js                    # Exports all components
└── README.md                   # This file
```

## 🎯 Components

### AgentReportCard
The main card component that displays the agent report status and handles modal interactions.

**Props:**
- `service` - Service identifier
- `state` - Current application state
- `t` - Translation function

**Features:**
- Shows completion status with green checkmark
- Displays submission timestamp
- "View Report" button for existing reports
- "Add Report" button for new reports

### AgentReportModal
The modal component for creating, viewing, and editing agent reports.

**Props:**
- `isOpen` - Modal visibility state
- `onClose` - Close handler
- `applicationNumber` - Application identifier
- `service` - Service identifier
- `serviceCode` - Service code from URL
- `state` - Application state
- `t` - Translation function
- `onSuccess` - Success callback
- `isViewMode` - View-only mode flag
- `existingChecklistData` - Existing data for view mode

**Features:**
- **View Mode**: Read-only display with download functionality
- **Edit Mode**: Modify existing reports
- **Submit Mode**: Create new reports
- File upload with drag & drop
- Download files
- Modern UI with brand colors (#0f6769, #73836a)

## 🔧 Hooks

### useAgentReportData
Manages data fetching and state for agent reports.

**Returns:**
- `checklistData` - Current checklist data
- `isSubmitted` - Submission status
- `isLoading` - Loading state
- `checkExistingChecklist` - Function to fetch existing data

### useAgentReportForm
Manages form state, validation, and file uploads.

**Returns:**
- `formData` - Form data state
- `errors` - Validation errors
- `uploadingFiles` - File upload state
- `handleInputChange` - Input change handler
- `handleFileUpload` - File upload handler
- `removeFile` - File removal handler
- `validateForm` - Form validation

### useAgentReportAPI
Manages API calls for submitting and downloading data.

**Returns:**
- `isLoading` - API loading state
- `submitChecklist` - Submit checklist function
- `downloadFile` - Download file function

## 🎨 Sub-components

### FileUploadSection
Reusable file upload component with download and remove functionality.

### ModalHeader
Modal header with edit functionality and contextual buttons.

## 🚀 Usage

```javascript
import { AgentReportCard } from '../components/AgentReport';

// In your component
<AgentReportCard 
  service={service} 
  state={state} 
  t={t} 
/>
```

## ✨ Features

- **Modern UI**: Clean, branded design with animations
- **File Management**: Upload, download, and remove files
- **View/Edit Modes**: Seamless switching between modes
- **Validation**: Form validation with error messages
- **Responsive**: Works on all screen sizes
- **Accessible**: Proper ARIA labels and keyboard navigation
- **Type Safe**: Proper prop validation and error handling

## 🎨 Brand Colors

- Primary: `#0f6769` (Teal)
- Secondary: `#73836a` (Olive)
- Success: `#166534` (Green)
- Error: `#ef4444` (Red)
- Neutral: `#6b7280` (Gray) 