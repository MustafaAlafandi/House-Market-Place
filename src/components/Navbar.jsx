import { ReactComponent as OfferIcon } from "../assets/svg/localOfferIcon.svg"
import { ReactComponent as ExploreIcon } from "../assets/svg/exploreIcon.svg"
import { ReactComponent as PersonOutlineIcon } from "../assets/svg/personOutlineIcon.svg"
import { useNavigate, useLocation } from "react-router-dom"
function Navbar() {
  const Navigate = useNavigate();
  const location = useLocation();
  const pathMatchRoute = (route) => {
    if (route === location.pathname)
      return true;
    return false;
  }
  const getLIColor = (route) => {
    if (pathMatchRoute(route))
      return '#2c2c2c';
    return '#8f8f8f'
  }
  const getParaClass = (route) => {
    if (pathMatchRoute(route))
      return 'navbarListItemNameActive';
    return '';
  }
  return (
    <footer className='navbar'>
      <nav className="navbarNav">
        <ul className="navbarListItems">
          <li className="navbarListItem" onClick={Navigate.bind(null, '/')}>
            <ExploreIcon fill={getLIColor('/')} width="36px" height="36px" />
            <p className={getParaClass('/')}>Explore</p>
          </li>
          <li className="navbarListItem" onClick={Navigate.bind(null, '/offers')}>
            <OfferIcon fill={getLIColor('/offers')} width="36px" height="36px" />
            <p className={getParaClass('/offers')}>Offers</p>
          </li>
          <li className="navbarListItem" onClick={Navigate.bind(null, '/profile')}>
            <PersonOutlineIcon fill={getLIColor('/profile')} width="36px" height="36px" />
            <p className={getParaClass('/profile')}>profile</p>
          </li>
        </ul>
      </nav>
    </footer>
  )
}

export default Navbar
