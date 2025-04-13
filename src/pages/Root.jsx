import { Outlet } from "react-router-dom"
import Navbar from "../components/Navbar"

function Root() {
  return (
    <div>
      <Outlet/>
      <Navbar/>
    </div>
  )
}

export default Root
