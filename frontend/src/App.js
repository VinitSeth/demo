import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { action as manipulateEventAction } from "./components/EventForm";
import AuthenticationPage, {
  action as authAction,
} from "./pages/Authentication";
import EditEventPage from "./pages/EditEvent";
import ErrorPage from "./pages/Error";
import EventDetailPage, {
  action as deleteEventAction,
  loader as eventDetailLoader,
} from "./pages/EventDetail";
import EventsPage, { loader as eventsLoader } from "./pages/Events";
import EventsRootLayout from "./pages/EventsRoot";
import HomePage from "./pages/Home";
import { action as logoutAction } from './pages/Logout';
import NewEventPage from "./pages/NewEvent";
import NewsletterPage, { action as newsletterAction } from "./pages/Newsletter";
import RootLayout from "./pages/Root";
import { checkAuthLoader, tokenLoader } from './util/auth';
import { useMsal, useMsalAuthentication } from "@azure/msal-react";
import { loginRequest } from "./util/auth-config";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    id: 'root',
    loader: tokenLoader,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: "events",
        element: <EventsRootLayout />,
        children: [
          {
            index: true,
            element: <EventsPage />,
            loader: eventsLoader,
          },
          {
            path: ":eventId",
            id: "event-detail",
            loader: eventDetailLoader,
            children: [
              {
                index: true,
                element: <EventDetailPage />,
                action: deleteEventAction,
              },
              {
                path: "edit",
                element: <EditEventPage />,
                action: manipulateEventAction,
                loader: checkAuthLoader,
              },
            ],
          },
          {
            path: "new",
            element: <NewEventPage />,
            action: manipulateEventAction,
            loader: checkAuthLoader,
          },
        ],
      },
      {
        path: "auth",
        element: <AuthenticationPage />,
        action: authAction,
      },
      {
        path: "newsletter",
        element: <NewsletterPage />,
        action: newsletterAction,
      },
      {
        path: 'logout',
        action: logoutAction,
      },
    ],
  },
]);

function App() {
  const { instance, accounts } = useMsal()
  const isLoggedIn = useMsalAuthentication();

  const handleLogin = () => {
    instance.loginPopup(loginRequest).catch((e) => {
      console.log(e);
    })
  }
  const handleLogout = () => {
    instance.logoutPopup().catch((e) => {
      console.log(e);
    })
  }

  return (
    <>
      {/* <RouterProvider router={router} /> */}
      {
        !isLoggedIn ?
          <>
            <button onClick={handleLogout}> Logout </button>
            logged in,{accounts[0]?.name}</> :
          <>
            <button onClick={handleLogin}> Login </button>
            not logged in</>
      }

    </>
  );
}

export default App;
