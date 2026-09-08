// import { createSlice } from "@reduxjs/toolkit";
// import { loggedUser, loginUser } from "./authAction";

// const authSlice = createSlice({
//     name:"auth",
//     initialState:{
//         user:null,
//         isLoading:false
//     },
//     reducers:{
//         addUser:(state,action)=>{
//             state.user=action.payload,
//             isLoading=false
//         },
//         removeUser:(state,action)=>{
//             state.user=null,
//             isLoading=false
//         }

//     },
//     extraReducers:(builder)=>{
//         builder.addCase(loginUser.pending,(state)=>{
//             state.isLoading=true
//         })
//         .addCase(loginUser.fulfilled,(state,action)=>{
            
//             state.isLoading=false
//             state.user=action.payload

//         })
//         .addCase(loginUser.rejected,(state)=>{
//             state.isLoading=false
//         })
//         .addCase(loggedUser.pending,(state)=>{
//             state.isLoading=true
//         })
//         .addCase(loggedUser.fulfilled,(state,action)=>{
            
//             state.isLoading=false
//             state.user=action.payload

//         })
//         .addCase(loggedUser.rejected,(state)=>{
//             state.isLoading=false
//         })
        
//     }
// })

// export let {addUser,removeUser}=authSlice.actions
// export default authSlice.reducer