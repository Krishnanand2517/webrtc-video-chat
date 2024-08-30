# WeTalk

A peer-to-peer Video Calling platform. Made using Socket.IO and WebRTC protocol.

## Table of Contents

- [Live Link](#live-link)
- [Technologies Used](#technologies-used)
- [Running the Project Locally](#running-the-project-locally)

## Live Link

You can check out WeTalk [here](https://we-talk-webrtc.vercel.app/).

## Technologies Used

### Frontend

- [WebRTC](https://webrtc.org/)
- [React](https://react.dev/)
- [TailwindCSS](https://tailwindcss.com/) for styling
- [Socket.IO](https://socket.io/docs/v4/client-api)
- [Context API](https://react.dev/learn/passing-data-deeply-with-context)

### Backend

- [Node.js](https://nodejs.org/en/about)
- [Socket.IO](https://socket.io/docs/v4/server-api)

## Running the Project Locally

These instructions will help you set up a copy of the project on your local machine.

### Prerequisites

Before getting started, make sure you have Node.js and npm (Node Package Manager) installed on your machine.

### Installing & Usage

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/Krishnanand2517/webrtc-video-chat
   ```

1. Navigate to the backend directory & install the project dependencies:

   ```bash
   cd server
   npm install
   ```

1. Once you have installed the project and its dependencies, you can run the development server:

   ```bash
   npm run dev
   ```

   This will start the backend server on port 8000, and now you can make HTTP requests to http://localhost:8000/.

1. Navigate to the frontend directory and install project dependencies:

   ```bash
   cd ..
   cd client
   npm install
   ```

1. Run the development server for frontend:

   ```bash
   npm run dev
   ```

   This will start the frontend server on port 5173, and you can access the web app in your web browser at http://localhost:5173/

### Contribute

If you encounter any issues, have suggestions, or want to contribute, feel free to open an issue or submit a pull request. Happy coding!
