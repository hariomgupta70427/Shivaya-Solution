import React from 'react';
import Hero from '../components/Home/Hero';
import ProductCategories from '../components/Home/ProductCategories';
import AboutSnippet from '../components/Home/AboutSnippet';

const Home: React.FC = () => {
  return (
    <div className="pt-16">
      <Hero />
      <ProductCategories />
      <AboutSnippet />
    </div>
  );
};

export default Home;