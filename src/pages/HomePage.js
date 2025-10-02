// Fixed HomePage.js - Brand section with proper fallbacks and no missing imports
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Modal from '../components/Modal';
import { CartContext } from '../context/CartContext';
import HeroSlider from '../components/HeroSlider';
import FeaturesBar from '../components/FeaturesBar';
import { Helmet  } from 'react-helmet-async';
import './HomePage.css';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'; 

const HomePage = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [tabProducts, setTabProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('New Arrival');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { addToCart } = useContext(CartContext);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Brand data with inline SVG logos or external URLs
  const brandData = [
    { name: 'Nike', logo: 'https://logos-world.net/wp-content/uploads/2020/04/Nike-Logo.png' },
    { name: 'Adidas', logo: 'https://logos-world.net/wp-content/uploads/2020/04/Adidas-Logo.png' },
    { name: 'Puma', logo: 'https://logos-world.net/wp-content/uploads/2020/04/Puma-Logo.png' },
    { name: "Levi's", logo: 'https://logos-world.net/wp-content/uploads/2020/04/Levis-Logo.png' },
    { name: 'Samsung', logo: 'https://logos-world.net/wp-content/uploads/2020/04/Samsung-Logo.png' },
    { name: 'Apple', logo: 'https://logos-world.net/wp-content/uploads/2020/04/Apple-Logo.png' }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch(`${API_URL}/products`);
      
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
      
        const data = await response.json();
        setAllProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setError(error.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let sortedProducts = [...allProducts];

    if (activeTab === 'New Arrival') {
      sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (activeTab === 'Best Selling' || activeTab === 'Top Rated') {
      sortedProducts.sort((a, b) => b.rating - a.rating);
    }

    setTabProducts(sortedProducts.slice(0, 8));
  }, [activeTab, allProducts]);

  const handleQuickView = (product) => { setSelectedProduct(product); };
  const handleCloseModal = () => { setSelectedProduct(null); };

  if (loading) {
    return (
      <div className="homepage">
        <div className="container">
          <div className="loading-state">
            <p>Loading homepage content...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="homepage">
        <div className="container">
          <div className="error-state">
            <p>Error loading content: {error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage">
       {/* Static SEO Tags for Homepage */}
      <Helmet>
        <title>PressMart - Manufacturer-Direct E-commerce Marketplace</title>
        <meta name="description" content="Shop verified manufacturer products direct. Find the best deals on Electronics, Apparel, and Home Goods with secure payment and fast shipping." />
        <link rel="canonical" href="https://press-mart1.netlify.app/" /> 
      </Helmet>
      <HeroSlider />
      <FeaturesBar />

      <section className="category-banners">
        <div className="container">
          <div className="category-banners-grid-new">
            <Link to="/shop?category=Apparel" className="main-banner-item">
              <div className="main-banner-content">
                <span className="subtitle">New Arrivals</span>
                <h3>Women's Style</h3>
                <p>Up to 70% Off</p>
                <button className="banner-shop-btn">Shop Now</button>
              </div>
            </Link>

            <div className="small-banners-column">
              <Link to="/shop?category=Bags" className="small-banner-item">
                <img src="https://images.pexels.com/photos/1034859/pexels-photo-1034859.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Handbag" />
                <div className="small-banner-content">
                  <span className="discount-badge">25% OFF</span>
                  <h4>Handbag</h4>
                  <span className="shop-now-text">Shop Now <span className="arrow">›</span></span>
                </div>
              </Link>

              <Link to="/shop?category=Watch" className="small-banner-item">
                <img src="https://images.pexels.com/photos/2113994/pexels-photo-2113994.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Watch" />
                <div className="small-banner-content">
                  <span className="discount-badge">45% OFF</span>
                  <h4>Watch</h4>
                  <span className="shop-now-text">Shop Now <span className="arrow">›</span></span>
                </div>
              </Link>

              <Link to="/shop?category=Bags" className="small-banner-item large-bottom-banner">
                <img src="https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Backpack" />
                <div className="small-banner-content">
                  <span className="subtitle">Accessories</span>
                  <h4>Backpack</h4>
                  <p>Min. 40-80% Off</p>
                  <span className="shop-now-text">Shop Now <span className="arrow">›</span></span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <section className="featured-products container">
        <div className="section-header">
          <h2>Featured Products</h2>
          <div className="product-tabs">
            <button className={`tab-btn ${activeTab === 'New Arrival' ? 'active' : ''}`} onClick={() => setActiveTab('New Arrival')}>New Arrival</button>
            <button className={`tab-btn ${activeTab === 'Best Selling' ? 'active' : ''}`} onClick={() => setActiveTab('Best Selling')}>Best Selling</button>
            <button className={`tab-btn ${activeTab === 'Top Rated' ? 'active' : ''}`} onClick={() => setActiveTab('Top Rated')}>Top Rated</button>
          </div>
        </div>
        <div className="product-grid">
          {tabProducts.length > 0 ? (
            tabProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onQuickViewClick={handleQuickView}
              />
            ))
          ) : ( 
            <div className="no-products-message">
              <p>No products available at the moment.</p>
              <Link to="/shop">
                <button>Browse All Products</button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="promo-banners-section container">
        <Link to="/shop?category=Apparel" className="promo-banner">
          <img src="https://images.pexels.com/photos/1689731/pexels-photo-1689731.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Men's Fashion Sale" />
          <div className="promo-banner-content">
            <p>Weekend Sale</p>
            <h3>Men's Fashion</h3>
            <span>Flat <strong>70%</strong> OFF</span>
            <span className="shop-now-link">Shop Now →</span>
          </div>
        </Link>
        <Link to="/shop?category=Apparel" className="promo-banner">
          <img src="https://images.pexels.com/photos/3767407/pexels-photo-3767407.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Women's Wear" />
          <div className="promo-banner-content">
            <p>Fashion Style</p>
            <h3>Women's Wear</h3>
            <span>Min. <strong>40-70%</strong> OFF</span>
            <span className="shop-now-link">Shop Now →</span>
          </div>
        </Link>
      </section>
      
      {/* Fixed Brands Section - No missing imports */}
      <section className="brands-section">
        <div className="container">
          <h2 className="brands-title">Shop by Brand</h2>
          <div className="logo-carousel-container">
            <div className="logo-carousel">
              {/* Render brands twice for seamless scrolling */}
              {[...brandData, ...brandData].map((brand, index) => (
                <Link to={`/shop?brand=${encodeURIComponent(brand.name)}`} key={`${brand.name}-${index}`}>
                  <img 
                    src={brand.logo} 
                    alt={brand.name}
                    onError={(e) => {
                      // Fallback to text-based logo if image fails
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div className="brand-text-fallback" style={{ display: 'none' }}>
                    {brand.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Modal isOpen={!!selectedProduct} onClose={handleCloseModal}>
        {selectedProduct && (
          <div className="product-detail-layout">
            <div className="product-detail-image">
              <img src={selectedProduct.image} alt={selectedProduct.name} />
            </div>
            <div className="product-detail-info">
              <h1>{selectedProduct.name}</h1>
              <div className="product-rating">★★★★☆ ({selectedProduct.rating})</div>
              <p className="product-price">${selectedProduct.price.toFixed(2)}</p>
              <p className="product-description">{selectedProduct.description}</p>
              <button onClick={() => { 
                addToCart(selectedProduct); 
                handleCloseModal(); 
              }} className="add-to-cart-btn">
                Add to Cart
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HomePage;