# HappyFox PyCon Bug Bounty Leaderboard

A beautiful and responsive leaderboard application for tracking competition participants and their performance.

## Features

- 🏆 **Podium Display**: Top 3 performers with animated podium cards
- 📊 **Full Leaderboard**: Complete ranking table with pagination
- 🎨 **Modern UI**: Beautiful gradients, animations, and responsive design
- 📱 **Mobile Friendly**: Responsive design that works on all devices
- 🌙 **Dark Mode Ready**: CSS variables for easy theme switching

## Tech Stack

- **Frontend**: React 19 + JSX
- **Styling**: Tailwind CSS with custom CSS variables
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Build for production:

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── LeaderboardHeader.jsx
│   ├── Podium.jsx
│   ├── PodiumCard.jsx
│   ├── LeaderboardTable.jsx
│   └── Pagination.jsx
├── pages/              # Page components
│   ├── Index.jsx
│   └── NotFound.jsx
├── data/               # Mock data and interfaces
│   └── mockData.js
├── App.jsx             # Main application component
├── main.jsx            # Application entry point
└── index.css           # Global styles and Tailwind CSS
```

## Components

### LeaderboardHeader

Displays the competition title, date, and participant count with trophy icons.

### Podium

Shows the top 3 performers in a visually appealing podium layout.

### PodiumCard

Individual podium cards with rank-specific styling, animations, and participant information.

### LeaderboardTable

Complete ranking table with pagination, rank badges, and participant details.

### Pagination

Smart pagination component with page navigation and ellipsis for large datasets.

## Styling

The application uses Tailwind CSS with custom CSS variables for:

- Color schemes (light/dark mode ready)
- Competition-specific colors (gold, silver, bronze)
- Custom gradients and shadows
- Smooth animations and transitions

## Data Structure

The application uses mock data with the following structure:

- **Participant**: id, name, points, bugsFound, avatar
- **Competition Info**: title, date, activeParticipants

## Customization

- Colors and themes can be modified in `src/index.css`
- Tailwind configuration in `tailwind.config.js`
- Component styling can be adjusted using Tailwind classes

## Browser Support

- Modern browsers with ES6+ support
- Responsive design for mobile and desktop
- Progressive enhancement approach
