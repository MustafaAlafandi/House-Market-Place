import { useState, useEffect} from 'react'
// import { useParams } from 'react-router-dom'
import { collection, getDocs, query, where, orderBy, limit, startAfter } from 'firebase/firestore'
import { db } from '../firebase.config'
import { toast } from 'react-toastify'
import Spinner from '../components/Spinner'
import ListingItem from '../components/ListingItem'
function Offers() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastFetchedListing, setLastFetchedListing] = useState(null);
  // const params = useParams();
  const fetchMoreListingsHandler = async () => {
    try {
      const listingsRef = collection(db, 'llistings');
      // Create a query 
      let q;
      if (lastFetchedListing)
        q = query(listingsRef, where('offer', '==', true), orderBy('timestamp', 'desc'), limit(1), startAfter(lastFetchedListing));
      else
        q = query(listingsRef, where('offer', '==', true), orderBy('timestamp', 'desc'), limit(1));

      // Execute query
      const querySnap = await getDocs(q);
      console.log(querySnap);
      const lastVisible = querySnap.docs[querySnap.docs.length - 1]
      setLastFetchedListing(lastVisible);
      let listings = [];
      querySnap.forEach((doc) => {
        listings.push({
          id: doc.id,
          data: doc.data(),
        })
      })
      console.log("listings", listings);
      setListings((preState) => {
        return [...preState, ...listings];
      }
      );
      setLoading(false);
    }
    catch (error) {
      toast.error("Could not fetch listings");
    }
  };
  useEffect(() => {
    fetchMoreListingsHandler();
  }, [])
  return (
    <div className="category">
      <header>
        <p className="pageHeader">
          Offers
        </p>
      </header>
      {loading ? <Spinner /> : listings && listings.length > 0 ?
        <>
          <main>
            <ul className="categoryListings">
              {listings.map((listing) => (
                <ListingItem listing={listing.data} id={listing.id} key={listing.id} />
              ))}
            </ul>
          </main>
          <br />
          <br />
          {lastFetchedListing && <p className="loadMore" onClick={() => {
            console.log("from click");
            fetchMoreListingsHandler()
          }}>Load More</p>}
        </> : <p>There are no current offers</p>}
    </div>
  )
}

export default Offers
