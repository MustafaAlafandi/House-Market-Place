import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Root from "./pages/Root";
import PrivateRoute from "./components/PrivateRoute.jsx";
import Explore from "./pages/Explore";
import Offers from "./pages/Offers";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgetPassword from "./pages/ForgetPassword";
import Profile from "./pages/Profile";
import Category from "./pages/Category";
import CreateListing from "./pages/CreateListing";
import EditListing from "./pages/EditListing.jsx";
import Listing from "./pages/Listing";
import Contact from "./pages/Contact"
const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      { path: "/", element: <Explore /> },
      {
        path: "/profile",
        element: <PrivateRoute />,
        children: [
          {
            path: "",
            element: <Profile />,
          },
        ],
      },
      { path: "/offers", element: <Offers /> },
    ],
  },
  { path: "/sign-in", element: <SignIn /> },
  { path: "/sign-up", element: <SignUp /> },
  { path: "/forgot-password", element: <ForgetPassword /> },
  {
    path: "/category/:categoryName",
    element: <Category />,
  },
  { path: "/category/:categoryName/:listingId", element: <Listing /> },
  { path: "/create-listing", element: <CreateListing /> },
  { path: "/edit-listing/:listingId", element: <EditListing /> },
  { path: "/contact/:landlordId", element: <Contact /> },
]);
function App() {
  return (
    <>
      <RouterProvider router={router}>
        <h1>MY APP</h1>
      </RouterProvider>
      <ToastContainer />
    </>
  );
}

export default App;
