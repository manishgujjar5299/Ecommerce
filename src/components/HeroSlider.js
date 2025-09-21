import React from 'react';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import './HeroSlider.css';

const HeroSlider = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000, // Changes slide every 3 seconds
    arrows: false, // Hides the default arrows
  };

  return (
    <section className="hero-slider-section">
      <Slider {...settings}>
        {/* --- Slide 1: Men's Fashion --- */}
        <div className="slide">
          <div className="hero-slide-content">
            <div className="hero-text-content">
              <span className="hero-pre-title">Season Sale</span>
              <h1 className="hero-title">MEN'S FASHION</h1>
              <p className="hero-description">Min. 35-70% OFF</p>
              <div className="hero-buttons">
                <Link to="/shop" className="btn">SHOP NOW</Link>
                <Link to="#" className="btn btn-outline">READ MORE</Link>
              </div>
            </div>
            <div className="hero-image-container">
              <img src="https://images.pexels.com/photos/837140/pexels-photo-837140.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Men's Fashion" />
            </div>
          </div>
        </div>

        {/* --- Slide 2: Women's Fashion --- */}
        <div className="slide">
          <div className="hero-slide-content">
            <div className="hero-text-content">
              <span className="hero-pre-title">New Collection</span>
              <h1 className="hero-title">WOMEN'S STYLE</h1>
              <p className="hero-description">Up to 50% OFF</p>
              <div className="hero-buttons">
                <Link to="/shop?category=Apparel" className="btn">SHOP NOW</Link>
                <Link to="#" className="btn btn-outline">VIEW LOOKBOOK</Link>
              </div>
            </div>
            <div className="hero-image-container">
              <img src="https://images.pexels.com/photos/1845208/pexels-photo-1845208.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Women's Style" />
            </div>
          </div>
        </div>
      </Slider>
    </section>
  );
};

export default HeroSlider;