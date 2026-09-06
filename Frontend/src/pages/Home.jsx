// src/pages/Home.jsx
import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/home/Hero";
import StatsBar from "../components/home/StatsBar";
import HowItWorks from "../components/home/HowItWorks";
import CTASection from "../components/home/CTASection";
import ImageCarousel from "../components/home/ImageCarousel";
import Pothole_photo1 from "../assets/Pothole_photo1.jpg";
import Pothole_photo2 from "../assets/Pothole_photo2.jpg";

import Pothole_photo3 from "../assets/Pothole_photo3.jpg";


const Home = () => {
  const images=[
    
     Pothole_photo1,
      Pothole_photo2,
       Pothole_photo3
  ]
  return (
    <div className="bg-background min-h-screen">
      <ImageCarousel images={images}/>
      <Hero />
      <StatsBar />
      <HowItWorks />
      <CTASection />
      
    </div>
  );
};

export default Home;