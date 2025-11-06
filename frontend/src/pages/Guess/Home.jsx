import React from "react";
import Header from "../../components/guess/Header";
import Hero from "../../components/guess/Hero";
import Knowledge from "../../components/guess/Knowledge";
import Doctors from "../../components/guess/Doctors";
import Services from "../../components/guess/Services";
import Testimonials from "../../components/guess/Testimonials";
import Footer from "../../components/guess/Footer";

export default function Home() {
  return (
    <div className="text-gray-800 font-sans">
      <Header />
      <Hero />
      <Knowledge />
      <Doctors />
      <Services />
      <Testimonials />
      <Footer />
    </div>
  );
}
