import React from 'react';
import Hero from '../components/home/Hero';
import GenderBanners from '../components/home/GenderBanners';
import PromoBanner from '../components/home/PromoBanner';
import WhatsHot from '../components/home/WhatsHot';
import CategoriesGrid from '../components/home/CategoriesGrid';
import SpecialOfferBanner from '../components/home/SpecialOfferBanner';
import ProductAtelierSpec from '../components/product/ProductAtelierSpec';
import DealsOfTheDay from '../components/home/DealsOfTheDay';
import DiscoverCollection from '../components/home/DiscoverCollection';

export default function Home() {
  return (
    <div className="bg-white min-h-screen">
      {/* 1. Dark Luxury Hero */}
      <Hero />

      {/* 2. Side-by-Side Gender Banners */}
      <GenderBanners />

      {/* 3. 25% Off Summer Collection Split Banner */}
      <PromoBanner />

      {/* 4. Whats Hot - 7/5 Asymmetric Spotlight */}
      <WhatsHot />

      {/* 5. Our Categories - 4 Full-Bleed Cards */}
      <CategoriesGrid />

      {/* 6. Special Offer - Frames from ₹999 Banner */}
      <SpecialOfferBanner />

      {/* 7. Product Atelier Spec - 7/5 Asymmetric Spec Grid Showcase */}
      <ProductAtelierSpec />

      {/* 8. Deals of the Day - 5/7 Editorial Manifesto Split */}
      <DealsOfTheDay />

      {/* 9. Discover Our Collection - Asymmetric Bento Matrix */}
      <DiscoverCollection />
    </div>
  );
}
