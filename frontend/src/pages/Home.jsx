import React from 'react';
import Hero from '../components/home/Hero';
import WhatsHot from '../components/home/WhatsHot';
import DealsOfTheDay from '../components/home/DealsOfTheDay';
import OpticalLabSimulator from '../components/home/OpticalLabSimulator';
import SpecialProduct from '../components/home/SpecialProduct';
import ValueProps from '../components/home/ValueProps';
import Testimonials from '../components/home/Testimonials';

export default function Home() {
  return (
    <div className="pb-16 md:pb-0">
      {/* 3D Interactive Hero with tilt & parallax (preserved) */}
      <Hero />

      {/* Explore Categories Carousel */}
      <WhatsHot />

      {/* Featured Deals with live products */}
      <DealsOfTheDay />

      {/* Interactive Optical Engineering Lab Simulator */}
      <OpticalLabSimulator />

      {/* Signature Aurelia Showcase */}
      <SpecialProduct />

      {/* Craftsmanship & Trust Value Propositions */}
      <ValueProps />

      {/* Verified Customer Reviews */}
      <Testimonials />
    </div>
  );
}
