import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { SocketProvider } from "./context/SocketProvider.tsx";
import "./index.css";
import App from "./App.tsx";
import LobbyScreen from "./screens/Lobby.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <LobbyScreen />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <>
    <SocketProvider>
      <RouterProvider router={router} />
    </SocketProvider>
  </>
);
