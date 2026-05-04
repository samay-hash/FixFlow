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

const LandingPage: React.FC = () => {
  return (
    <div className="relative min-h-screen overflow-x-clip text-[#07111f]" style={{ fontFamily: '"Inter", sans-serif' }}>
      <Navbar />
      <Hero />
      <Solutions />
      <ProductFeatures />
      <MainFeatures />
      <IncidentWorkspace />
      
      <WhyTeamsSwitch />
      <Pricing />
      <Integrations />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
};

export default LandingPage;