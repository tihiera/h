import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App";
import FeedPage from "./pages/FeedPage";
import LaunchPage from "./pages/LaunchPage";
import MePage from "./pages/MePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <FeedPage /> },   // default = Feed
      { path: "feed", element: <FeedPage /> },
      { path: "launch", element: <LaunchPage /> },
      { path: "me", element: <MePage /> },      // NOT in the menu (avatar opens this)
    ],
  },
]);

createRoot(document.getElementById("root")).render(<RouterProvider router={router} />);
