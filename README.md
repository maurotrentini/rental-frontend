# Rental Management System - Frontend

A modern Vue.js 3 frontend application for managing rental properties, bookings, guests, and additional services.

## 🚀 Features

- **Modern Vue.js 3** with Composition API
- **Pinia** for state management
- **Vue Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API communication
- **Responsive Design** - Mobile-first approach
- **Authentication** - JWT token-based auth
- **Real-time Updates** - Reactive data management

## 📋 Prerequisites

- Node.js 16+ and npm
- Laravel backend API running on `http://localhost:8000`

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.local .env
   ```
   
   Update `.env` if your backend runs on a different URL:
   ```
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable components
│   └── layout/         # Layout components (Header, Sidebar)
├── pages/              # Page components
├── router/             # Vue Router configuration
├── services/           # API service layer
├── stores/             # Pinia stores for state management
├── style.css           # Global styles
└── main.js            # Application entry point
```

## 🔐 Authentication

The app uses JWT token-based authentication:

1. **Login** - User enters credentials
2. **Token Storage** - JWT stored in localStorage
3. **API Requests** - Token automatically added to headers
4. **Route Protection** - Unauthenticated users redirected to login

### Demo Credentials
- **Email:** admin@rental.com
- **Password:** password

## 📱 Pages & Features

### Dashboard
- Overview statistics
- Recent bookings
- Quick navigation

### Properties
- List all properties with search/filter
- Create/edit property forms
- Property availability checking
- Responsive property cards

### Bookings
- Booking management with status filtering
- Date range filtering
- Real-time price calculation
- Extras selection
- Conflict prevention

### Guests
- Guest profile management
- Booking history modal
- Search functionality
- Contact information

### Extras
- Additional services management
- Active/inactive status
- Price management

## 🎨 UI Components

### Custom CSS Classes
```css
.btn                 # Base button styles
.btn-primary         # Primary button (blue)
.btn-secondary       # Secondary button (gray)
.btn-danger          # Danger button (red)
.form-input          # Form input styling
.form-label          # Form label styling
.card                # Card container
```

### Color System
- **Primary:** Blue (#3B82F6)
- **Success:** Green (#10B981)
- **Warning:** Amber (#F59E0B)
- **Error:** Red (#EF4444)
- **Gray Scale:** Various gray shades

## 🔧 API Integration

### Service Layer (`src/services/api.js`)
- Axios instance with base configuration
- Request interceptor for auth tokens
- Response interceptor for error handling
- Automatic token refresh on 401 errors

### Store Pattern
Each entity has its own Pinia store:
- `authStore` - Authentication state
- `propertyStore` - Property management
- `bookingStore` - Booking operations
- `guestStore` - Guest management
- `extraStore` - Extra services

## 🚀 Build & Deploy

### Development
```bash
npm run dev          # Start dev server
```

### Production Build
```bash
npm run build        # Build for production
npm run preview      # Preview production build
```

### Deployment Options
- **Netlify:** Connect GitHub repo for auto-deploy
- **Vercel:** Import project from GitHub
- **Traditional Hosting:** Upload `dist/` folder

## 🔍 Key Features

### Responsive Design
- Mobile-first approach
- Breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Touch-friendly interface

### Real-time Updates
- Reactive data with Pinia
- Automatic UI updates
- Loading states

### Error Handling
- Form validation
- API error messages
- User-friendly notifications

### Performance
- Code splitting with Vue Router
- Lazy loading of components
- Optimized bundle size

## 🧪 Development Tips

### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `src/router/index.js`
3. Update navigation in `AppSidebar.vue`

### State Management
```javascript
// In a component
import { usePropertyStore } from '@/stores/propertyStore'

const propertyStore = usePropertyStore()
await propertyStore.fetchProperties()
```

### API Calls
```javascript
// Direct API call
import api from '@/services/api'
const response = await api.get('/properties')
```

## 🐛 Troubleshooting

### Common Issues

**CORS Errors:**
- Ensure Laravel backend has CORS configured
- Check API base URL in `.env`

**Authentication Issues:**
- Clear localStorage: `localStorage.clear()`
- Check token expiration
- Verify backend authentication

**Build Errors:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version compatibility

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Verify backend API is running
3. Check network requests in DevTools
4. Review authentication token

---

**Happy coding! 🚀**