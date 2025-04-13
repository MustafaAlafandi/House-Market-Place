import { useState, useEffect, useRef } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase.config'
import { useNavigate, useParams } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
function EditListing() {
  const [geolocationEnabled, /* setGeolocationEnabled */] = useState(false);
  const [listing, setListing] = useState();
  const [formData, setFormData] = useState({ type: 'rent', name: '', bedrooms: 1, bathrooms: 1, parking: false, furnished: false, address: '', offer: false, regularPrice: 0, discountedPrice: 0, images: {}, latitude: 0, longitude: 0 });
  const { type, name, bedrooms, bathrooms, parking, furnished, address, offer, regularPrice, discountedPrice, images, latitude, longitude } = formData;
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const navigate = useNavigate();
  const params = useParams();
  const isMounted = useRef(true);
  useEffect(() => {
    if (listing && listing.userRef !== auth.currentUser.uid) {
      toast.error('You can not edit that listing');
      navigate('/');
    }
  })
  useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setFormData((prevState) => {
            return { ...prevState, userRef: user.uid }
          });
        }
        else {
          navigate('/sign-in')
        }
      })
      setLoading(false);
    }
    return () => { isMounted.current = false };
  }, [isMounted, setLoading, navigate, setFormData, auth])
  useEffect(() => {
    setLoading(true);
    const fetchListing = async () => {
      const docRef = doc(db, 'llistings', params.listingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setListing(docSnap.data());
        setFormData({ ...docSnap.data(), address: docSnap.data().location });
        setLoading(false);
      } else {
        navigate('/');
        toast.error('Listing does not exist');
      }
    }
    fetchListing();
  }, [params.listingId, navigate])
  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (discountedPrice >= regularPrice) {
      toast.error("Dicounted price need to be less then regular price");
      setLoading(false);
      return;
    }
    if (images.length > 6) {
      setLoading(false);
      toast.error("You can only upload 6 images at most");
      return;
    }
    let geolocation = {};
    let location;
    if (geolocationEnabled) {
      let key = process.env.REACT_APP_GEOCODE_API_KEY;
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${key}`);
      const data = await response.json();
      geolocation.lat = data.results[0].geometry.location.lat ?? 0;
      geolocation.lng = data.results[0].geometry.location.lng ?? 0
      location = data.status === 'ZERO_RESULTS' ? undefined : data.results[0]?.formatted_address
      if (location === undefined || location.includes('undefined')) {
        setLoading(false);
        toast.error("Please enter a correct address");
        return;
      }
    } else {
      geolocation.lat = latitude;
      geolocation.lng = longitude;
    }
    // Store images in firebase
    const storeImage = async (image) => {
      return new Promise((resolve, reject) => {
        const storage = getStorage();
        const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;
        const storageRef = ref(storage, 'images/' + fileName);
        const uploadTask = uploadBytesResumable(storageRef, image)
        uploadTask.on('state_changed', (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          switch (snapshot.state) {
            case 'paused': console.log('Upload is paused')
              break
            case 'running':
              console.log('Upload is running')
              break
            default:
              break
          }
        },
          (error) => {
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL)
            })
          }
        )
      })
    }

    const imgUrls = await Promise.all([...images].map((image) => storeImage(image))).catch(() => {
      setLoading(false);
      toast.error("Images not uploaded");
      return;
    })
    const formDataCopy = {
      ...formData,
      imgUrls,
      geolocation,
      timestamp: serverTimestamp()
    }
    formDataCopy.location = address;
    delete formDataCopy.images;
    delete formDataCopy.address;
    location && (formDataCopy.location = location)
    !formDataCopy.offer && delete formDataCopy.discountedPrice
    const docRef = doc(db, 'llistings', params.listingId);
    await updateDoc(docRef, formDataCopy);
    setLoading(false);
    toast.success('Listing saved');
    navigate(`/category/${formDataCopy.type}/${docRef.id}`);
  }
  const mutateHandler = (e) => {
    let boolean = null;
    if (e.target.value === 'true') {
      boolean = true;
    }
    if (e.target.value === 'false') {
      boolean = false;
    }
    //Files 
    if (e.target.files) {
      setFormData((prevState) => ({ ...prevState, images: e.target.files }));
    }
    //Text/Booleans/Numbers
    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }))
    }
  }
  if (loading) {
    return <Spinner />
  }
  return (
    <div className="profile">
      <header>
        <p className="pageHeader">Edit Listing</p>
      </header>
      <main>
        <form onSubmit={submitHandler}>
          <label className="formLabel">Sell / Rent</label>
          <div className="formButtons">
            <button type="button" className={type === 'sell' ? 'formButtonActive' : 'formButton'} id="type" value="sell" onClick={mutateHandler}>Sell</button>
            <button type="button" className={type === 'rent' ? 'formButtonActive' : 'formButton'} id="type" value="rent" onClick={mutateHandler}>Rent</button>
          </div>
          <label className="formLabel">Name</label>
          <input type="text" className="formInputName" id="name" value={name} onChange={mutateHandler} maxLength="32" minLength="10" required />
          <div className="formRooms flex">
            <div>
              <label className="formLabel">Bedrooms</label>
              <input type="text" className="formInputSmall" id="bedrooms" value={bedrooms} onChange={mutateHandler} min="1" max="50" required />
            </div>
            <div>
              <label className="formLabel">Bathrooms</label>
              <input type="number" className="formInputSmall" id="bathrooms" value={bathrooms} onChange={mutateHandler} min="1" max="50" required />
            </div>
          </div>
          <label className="formLabel">Parking spot</label>
          <div className="formButtons">
            <button className={parking ? 'formButtonActive' : 'formButton'} type="button" id="parking" value={true} onClick={mutateHandler} > Yes</button>
            <button className={!parking && parking !== null ? 'formButtonActive' : 'formButton'} type="button" id="parking" value={false} onClick={mutateHandler}> No</button>
          </div>
          <label className="formLabel">Furnished</label>
          <div className="formButtons">
            <button className={furnished ? 'formButtonActive' : 'formButton'} type="button" id="furnished" value={true} onClick={mutateHandler}> Yes</button>
            <button className={!furnished && furnished !== null ? 'formButtonActive' : 'formButton'} type="button" id="furnished" value={false} onClick={mutateHandler}> No</button>
          </div>
          <label className="formLabel">Address</label>
          <textarea className="formInputAddress" type="text" id="address" value={address} onChange={mutateHandler} required></textarea>
          {!geolocationEnabled && (
            <div className="formLatLng flex">
              <div>
                <label className="formLabel">Latitude</label>
                <input className="formInputSmall" type="number" id="latitude" value={latitude} onChange={mutateHandler} required />
              </div>
              <div>
                <label className="formLabel">Longitude</label>
                <input className="formInputSmall" type="number" id="longitude" value={longitude} onChange={mutateHandler} required />
              </div>
            </div>
          )}
          <label className="formLabel">Offer</label>
          <div className="formButtons">
            <button className={offer ? 'formButtonActive' : 'formButton'} type="button" id="offer" value={true} onClick={mutateHandler}>Yes</button>
            <button className={!offer && offer !== null ? 'formButtonActive' : 'formButton'} type="button" id="offer" value={false} onClick={mutateHandler}>No</button>
          </div>
          <label className="formLabel">Regular Price</label>
          <div className="formPriceDiv">
            <input className="formInputSmall" type="number" id="regularPrice" value={regularPrice} onChange={mutateHandler} min="50" max="75000000" required />
            {type === 'rent' && (
              <p className="formPriceText">$ / Month</p>
            )}
          </div>
          {offer && (
            <>
              <label className="formLabel">Discounted Price</label>
              <input className="formInputSmall" type='number' id='discountedPrice' value={discountedPrice} onChange={mutateHandler} min="50" max="75000000" required={offer} />
            </>
          )}
          <label className="formLabel">Images</label>
          <p className="imagesInfo">The first image will be the cover (max 6).</p>
          <input className="formInputFile" type="file" id="images" onChange={mutateHandler} max="6" accept=".jpg,.png,.jpeg" multiple required />
          <button className="primaryButton createListingButton" type="submit">Edit Listing</button>
        </form>
      </main>
    </div>
  )
}
export default EditListing;
