# VoiceForm Web Frontend

VoiceForm is a modern web application that enables voice-powered form filling, making form completion faster and more accessible.

## Features

- Voice-powered form filling
- Real-time voice transcription
- Form builder with drag-and-drop interface
- PDF form extraction
- Authentication with email/password and SSO
- Responsive design with Tailwind CSS

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Headless UI

## Development Modes

The application supports four different modes of operation:

### 1. Local UI Mode (local-ui)

For UI development without requiring a backend server. Uses mock data for all operations.

```bash
# .env.local
REACT_APP_ENVIRONMENT=local-ui
```

In this mode:
- All API calls are intercepted and return mock data
- Voice input processing is simulated
- Emails are logged to console instead of being sent
- Perfect for UI development and testing

### 2. Local Development Mode (local-dev)

For full-stack development with a local backend server.

```bash
# .env.local
REACT_APP_ENVIRONMENT=local-dev
REACT_APP_API_URL=http://localhost:3001
```

In this mode:
- Connects to a local backend server
- Real API calls are made
- Requires the backend server to be running
- Best for full-stack development

### 3. Staging Mode (staging)

For testing in a staging environment.

```bash
# .env.staging
REACT_APP_ENVIRONMENT=staging
```

In this mode:
- Connects to the staging backend (https://staging-api.voiceform.app)
- Uses staging services for AI and email
- Perfect for QA and testing

### 4. Production Mode (production)

For production deployment.

```bash
# .env.production
REACT_APP_ENVIRONMENT=production
```

In this mode:
- Connects to the production backend (https://api.voiceform.app)
- Uses production services for AI and email
- No mock data or simulations

## Configuration

The application's configuration is managed through the `src/config` directory:

- `src/config/index.ts`: Main configuration file
- `src/config/mockData.ts`: Mock data for local-ui mode

You can customize the following aspects:
- API URLs for different environments
- Product branding (name, colors, etc.)
- Feature flags
- Authentication providers
- Mock data generation

## Environment Variables

Required environment variables:

- `REACT_APP_ENVIRONMENT`: The environment mode ('local-ui', 'local-dev', 'staging', 'production')
- `REACT_APP_API_URL`: The backend API URL (only required for local-dev mode)

Optional environment variables:

- `REACT_APP_BRAND_NAME`: Override the default brand name
- `REACT_APP_PRIMARY_COLOR`: Override the default primary color
- `REACT_APP_SECONDARY_COLOR`: Override the default secondary color

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/voiceform-web.git
   cd voiceform-web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your desired configuration
4. Start the development server:
   ```bash
   npm start
   ```

For local UI development:
```bash
REACT_APP_ENVIRONMENT=local-ui npm start
```

For local full-stack development:
```bash
REACT_APP_ENVIRONMENT=local-dev REACT_APP_API_URL=http://localhost:3001 npm start
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
npm run build
```

This will create an optimized production build in the `build` folder.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── layouts/       # Layout components
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── types/         # TypeScript types
└── assets/        # Static assets
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure you test in all relevant environment modes before submitting a PR.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
