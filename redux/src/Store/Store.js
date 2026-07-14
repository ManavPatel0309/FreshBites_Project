import {configureStore} from "@reduxjs/toolkit"
import cartReducer from "./cartSlice"

let Store=configureStore({
    reducer:{
        cart:cartReducer
    }
})



export default Store