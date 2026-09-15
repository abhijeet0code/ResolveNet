import { createRoot } from 'react-dom/client'
import './index.css'
import AppRoute from './app/routes/AppRoute.jsx'
// import {Provider} from "react-redux"
// import store from './app/store.jsx'

createRoot(document.getElementById('root')).render(
    // <Provider store={store}></Provider>
    <AppRoute />

    
)
