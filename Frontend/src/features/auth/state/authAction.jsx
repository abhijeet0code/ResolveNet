// import { createAsyncThunk } from "@reduxjs/toolkit";
// import axiosInstance from "../../../config/axiosInstance";

// export const loginUser =createAsyncThunk("/api/login",async(credentials,thunkApi)=>{
//     try {

//         let  res = await axiosInstance.post("/api/login",credentials)

//         return res.data
        
//     } catch (error) {
//         thunkApi.rejectWithValue(error)
//     }

// })

// export const loggedUser= createAsyncThunk("/api/me",async(_,thunkApi)=>{
// try {
//     let res = await axiosInstance.get("/api/me")
//     return res.data.user
// } catch (error) {
//     thunkApi.rejectWithValue(error)
// }
// })