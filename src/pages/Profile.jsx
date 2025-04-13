import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getAuth, updateProfile } from 'firebase/auth'
import { db } from "../firebase.config"
import { doc, updateDoc, collection, getDocs, query, where, orderBy, deleteDoc } from 'firebase/firestore'
import { toast } from 'react-toastify';
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg'
import homeIcon from '../assets/svg/homeIcon.svg'
import ListingItem from '../components/ListingItem'
function Profile() {
  const auth = getAuth();
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState(null);
  const [changeDetails, setChangeDetails] = useState(false);
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  });
  const { name, email } = formData;
  const navigate = useNavigate();
  useEffect(() => {
    const fetchUserListings = async () => {
      const listingsRef = collection(db, 'llistings');
      const q = query(listingsRef, where('userRef', '==', auth.currentUser.uid), orderBy('timestamp', 'desc'));
      const querySnap = await getDocs(q);
      let listings = [];
      querySnap.forEach((doc) => {
        return listings.push({ id: doc.id, data: doc.data() });
      })
      setListings(listings);
      setLoading(false);
    }
    fetchUserListings();
  }, [auth.currentUser.uid])
  const logoutHandler = () => {
    auth.signOut();
    navigate('/');
  }
  const submitHandler = async () => {
    try {
      if (auth.currentUser.displayName !== name) {
        //Update display name in fb
        await updateProfile(auth.currentUser, {
          displayName: name,
        });
        //Update firestore 
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          name,
        });
      }
    }
    catch (error) {
      toast.error('Could not update profile details');
    }
  }
  const changeDetailsHandler = () => {
    changeDetails && submitHandler();
    setChangeDetails(preState => !preState);
  }
  const changeDetialsHandler = (e) => {
    setFormData((prevState) => ({ ...prevState, [e.target.id]: e.target.value, }))
  }
  const deleteHandler = async (listingId) => {
    if (window.confirm("Are you sure you want to delete?")) {
      await deleteDoc(doc(db, 'llistings', listingId))
      const updatedListings = listings.filter((listing) => listing.id !== listingId);
      setListings(updatedListings);
      toast.success("Successfully deleted listing");
    }
  }
  const editHandler = (listingId) => navigate(`/edit-listing/${listingId}`);
  return <div className="profile">
    <header className="profileHeader">
      <p className="pageHeader">My Profile</p>
      <button type="button" className="logOut" onClick={logoutHandler}>Logout</button>
    </header>
    <main>
      <div className="profileDetailsHeader">
        <p className="profileDetailsText">
          Personal Details
        </p>
        <p className="changePersonalDetails" onClick={changeDetailsHandler}>
          {changeDetails ? 'done' : 'change'}
        </p>
      </div>
      <div className="profileCard">
        <form>
          <input type="text" id="name" className={changeDetails ? 'profileName' : 'profileNameActive'} disabled={!changeDetails} value={name} onChange={changeDetialsHandler} />
          <input type="text" id="email" className={changeDetails ? 'profileEmail' : 'profileEmailActive'} disabled={!changeDetails} value={email} onChange={changeDetialsHandler} />
        </form>
      </div>
      <Link to='/create-listing' className='createListing'>
        <img src={homeIcon} alt="home" />
        <p>Sell or rent your home</p>
        <img src={arrowRight} alt="arrow right" />
      </Link>
      {!loading && listings?.length > 0 && (
        <>
          <p className="listingText">Your Listings</p>
          <ul className="listingsList">
            {listings.map((listing) => (
              <ListingItem key={listing.id} listing={listing.data} id={listing.id} onDelete={() => deleteHandler(listing.id)} onEdit={editHandler} />
            ))}
          </ul>
        </>
      )}
    </main>
  </div>
}

export default Profile
