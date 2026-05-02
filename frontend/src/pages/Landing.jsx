/* eslint-disable react/prop-types */
import React from 'react';
import {
  Navbar,
  Hero,
  Solutions,
  MainFeatures,
  IncidentWorkspace,
  ProductFeatures,
  WhyTeamsSwitch,
  Pricing,
  Integrations,
  Testimonials,
  CTA,
  Footer
} from '../components/landing';

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#fffaf5] text-[#07111f]" style={{ fontFamily: '"Inter", sans-serif' }}>
      <Navbar />
      <Hero />
      <Solutions />
      <MainFeatures />
      <IncidentWorkspace />
      <ProductFeatures />
      <WhyTeamsSwitch />
      <Pricing />
      <Integrations />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}
