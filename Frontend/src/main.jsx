import { createRoot } from 'react-dom/client'
import './index.css'
import AppRoute from './app/routes/AppRoute.jsx'
import {Provider} from "react-redux"
import store from './app/store.jsx'
  import { ToastContainer } from 'react-toastify';


createRoot(document.getElementById('root')).render(
<<<<<<< HEAD
    // <Provider store={store}></Provider>
    <AppRoute />
=======
    <Provider store={store}>
        <ToastContainer/>
        <AppRoute/>
    </Provider>
    
>>>>>>> 1c25876f34c419c95d1485c3e49b00dc2ee2238f

    
)
