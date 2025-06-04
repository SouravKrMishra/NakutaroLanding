# Nakutaro Landing

A modern landing page built with React, TypeScript, and Vite.

## Features

- React with TypeScript
- Vite for fast development and building
- TailwindCSS for styling
- MongoDB for database
- Express.js backend

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- MongoDB connection string

## Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/NakutaroLanding.git
cd NakutaroLanding
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
PORT=3000
```

4. Start the development server:

```bash
npm run dev
```

## Building for Production

```bash
npm run build
```

## Deployment

The project includes a deployment script for AWS EC2. See `deploy.sh` for details.

## License

MIT
