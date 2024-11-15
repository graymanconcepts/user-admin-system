# user-admin-system

This is a complete User Admin System with all the required features:

1. User Management:
    
    - List view with search functionality
    - Create new users
    - View and edit user details
    - Status management (active/inactive/suspended)
2. User Details:
    
    - Comprehensive user profile editing
    - Organizational unit and manager's email fields
    - Password reset functionality
3. Administrative Actions:
    
    - User status management
    - Password reset
    - Profile updates
4. Reporting and Auditing:
    
    - Detailed audit logs
    - Activity tracking
    - User action history
5. User Experience:
    
    - Clean, modern UI with Tailwind CSS
    - Responsive design
    - Loading states and error handling
    - Toast notifications for actions

The system uses:

- React Query for data fetching
- React Hook Form for form handling
- React Router for navigation
- Zustand for auth state management
- SQLite for the database
- JWT for authentication

The application has an admin initialization feature that:

1. Creates an admin.json file with default admin credentials
2. Loads this admin account on server startup if it doesn't exist
3. Uses the credentials:
      Email: admin@example.com
      Password: admin123

To use the system:

1. Start the backend server: `npm run server`
2. The frontend dev server is already running
3. Create an initial user through the API or database
4. Log in through the login page
