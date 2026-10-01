import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../config/axiosInstance";

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, thunkApi) => {
    try {
      let res = await axiosInstance.post("/api/auth/login/", credentials);
      console.log("login",res);
      
      return res.data;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data || "Login failed"
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (credentials, thunkApi) => {
    try {
      let res = await axiosInstance.post("/api/auth/register/", credentials);
      // RegisterView is a plain CreateAPIView -> flat response, not nested under "data"
      console.log("register",res);
      return res.data;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data || "Registration failed"
      );
    }
  }
);

export const loggedUser = createAsyncThunk(
  "auth/me",
  async (_, thunkApi) => {
    try {
      let res = await axiosInstance.get("/api/auth/me/");
      console.log("loggedUser",res);
      
      return res.data;
    }  catch (error) {
      return thunkApi.rejectWithValue(error.response?.data || "Not logged in");
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  try {
    await axiosInstance.post("/api/auth/logout/");
  } catch (error) {
    // server error / expired token ho to bhi frontend se logout hona chahiye
  } finally {
    // request ke baad clear karna hai, warna interceptor ko token nahi milega
    localStorage.removeItem("token");
    localStorage.removeItem("tokenType");
  }
});