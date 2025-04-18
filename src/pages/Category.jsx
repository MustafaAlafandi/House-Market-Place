import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { collection, getDocs, query, where, orderBy, limit, startAfter } from 'firebase/firestore'
import { db } from '../firebase.config'
import { toast } from 'react-toastify'
import Spinner from '../components/Spinner'
import ListingItem from '../components/ListingItem'
function Category() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastFetchedListing, setLastFetchedListing] = useState(null);
    const params = useParams();
    useEffect(() => {
        const fetchListings = async () => {
            try {
                const listingsRef = collection(db, 'llistings');
                // Create a query 
                const q = query(listingsRef, where('type', '==', params.categoryName === "sale" ? "sell" : params.categoryName), orderBy('timestamp', 'desc'), limit(10));
                // Execute query
                const querySnap = await getDocs(q);
                const lastVisible = querySnap.docs[querySnap.docs.length - 1];
                setLastFetchedListing(lastVisible);
                let listings = [];
                querySnap.forEach((doc) => {
                    listings.push({
                        id: doc.id,
                        data: doc.data(),
                    })
                })
                setListings(listings);
                setLoading(false);
            }
            catch (error) {
                toast.error("Could not fetch listings");
            }
        }
        fetchListings();
    }, [])
    //Pagination
    const fetchMoreListingsHandler = async () => {
        try {
            const listingsRef = collection(db, 'llistings');
            // Create a query 
            const q = query(listingsRef, where('type', '==', params.categoryName), orderBy('timestamp', 'desc'), startAfter(lastFetchedListing), limit(10));
            // Execute query
            const querySnap = await getDocs(q);
            const lastVisible = querySnap.docs[querySnap.docs.length - 1];
            setLastFetchedListing(lastVisible);
            let listings = [];
            querySnap.forEach((doc) => {
                listings.push({
                    id: doc.id,
                    data: doc.data(),
                })
            })
            setListings((preState) => {
                return [...preState, ...listings];
            });
            setLoading(false);
        }
        catch (error) {
            toast.error("Could not fetch listings");
        }
    }
    return (
        <div className="category">
            <header>
                <p className="pageHeader">
                    {params.categoryName === 'rent' ? 'Places for rent' : 'places for sale'}
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
                    </main >
                    <br />
                    <br />
                    {lastFetchedListing && <p className="loadMore" onClick={fetchMoreListingsHandler}>Load More</p>}
                </> : <p>No listings for {params.categoryName}</p>}
        </div>
    )
}

export default Category
