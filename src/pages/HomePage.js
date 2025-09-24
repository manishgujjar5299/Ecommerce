import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Modal from '../components/Modal';
import { CartContext } from '../context/CartContext';
import HeroSlider from '../components/HeroSlider';
import './HomePage.css';
import FeaturesBar from '../components/FeaturesBar';
import brand1 from '../assets/brands/brand1.png';
import brand2 from '../assets/brands/brand2.png';
import brand3 from '../assets/brands/brand3.png';
import brand4 from '../assets/brands/brand4.png';


const HomePage = () => {
  // const promoData = [
  //   {
  //     title: 'Up to 60% Off | Smart furniture, smarter living',
  //     link: '/shop?category=Home%20Goods',
  //     items: [
  //       { name: 'Office Chairs', image: 'https://images.pexels.com/photos/1148957/pexels-photo-1148957.jpeg?auto=compress&cs=tinysrgb&w=400', link: '/shop?category=Home%20Goods' },
  //       { name: 'Sofas & Couches', image: 'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg?auto=compress&cs=tinysrgb&w=400', link: '/shop?category=Home%20Goods' },
  //       { name: 'Dining Sets', image: 'https://images.pexels.com/photos/279648/pexels-photo-279648.jpeg?auto=compress&cs=tinysrgb&w=400', link: '/shop?category=Home%20Goods' },
  //       { name: 'Gaming Chairs', image: 'https://images.pexels.com/photos/7238759/pexels-photo-7238759.jpeg?auto=compress&cs=tinysrgb&w=400', link: '/shop?category=Electronics' },
  //     ]
  //   },
  //   {
  //     title: 'Big savings on top TV brands | Up to 65% Off',
  //     link: '/shop?category=Electronics',
  //     items: [
  //       { name: 'Samsung TVs', image: 'https://images.pexels.com/photos/5721865/pexels-photo-5721865.jpeg?auto=compress&cs=tinysrgb&w=400', link: '/shop?brand=Samsung' },
  //       { name: 'LG TVs', image: 'https://images.pexels.com/photos/2251206/pexels-photo-2251206.jpeg?auto=compress&cs=tinysrgb&w=400', link: '/shop?brand=LG' },
  //       { name: 'Sony TVs', image: 'https://images.pexels.com/photos/333984/pexels-photo-333984.jpeg?auto=compress&cs=tinysrgb&w=400', link: '/shop?brand=Sony' },
  //       { name: '4K TVs', image: 'https://images.pexels.com/photos/6976094/pexels-photo-6976094.jpeg?auto=compress&cs=tinysrgb&w=400', link: '/shop?category=Electronics' },
  //     ]
  //   },
  //   {
  //     title: 'Revamp your home in style | Starting ₹199',
  //     link: '/shop?category=Home%20Goods',
  //     items: [
  //       { name: 'Cushion covers', image: 'https://images.pexels.com/photos/1400172/pexels-photo-1400172.jpeg?auto=compress&cs=tinysrgb&w=400', link: '/shop?category=Home%20Goods' },
  //       { name: 'Figurines & more', image: 'https://images.pexels.com/photos/1007023/pexels-photo-1007023.jpeg?auto=compress&cs=tinysrgb&w=400', link: '/shop?category=Home%20Goods' },
  //       { name: 'Home storage', image: 'https://images.pexels.com/photos/159984/bookshelf-book-books-library-159984.jpeg?auto=compress&cs=tinysrgb&w=400', link: '/shop?category=Home%20Goods' },
  //       { name: 'Lighting solutions', image: 'https://images.pexels.com/photos/1118124/pexels-photo-1118124.jpeg?auto=compress&cs=tinysrgb&w=400', link: '/shop?category=Home%20Goods' },
  //     ]
  //   },
  //   {
  //     title: 'Styles for Men | Upto 70% Off',
  //     link: '/shop?category=Apparel',
  //     items: [
  //       { name: 'Casual Shirts', image: 'https://images.pexels.com/photos/157675/fashion-men-s-individuality-black-and-white-157675.jpeg?auto=compress&cs=tinysrgb&w=400', link: '/shop?category=Apparel' },
  //       { name: 'Footwear', image: 'https://images.pexels.com/photos/267202/pexels-photo-267202.jpeg?auto=compress&cs=tinysrgb&w=400', link: '/shop?category=Shoes' },
  //       { name: 'Watches', image: 'https://images.pexels.com/photos/2113994/pexels-photo-2113994.jpeg?auto=compress&cs=tinysrgb&w=400', link: '/shop?category=Watch' },
  //       { name: 'Bags & Backpacks', image: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=400', link: '/shop?category=Bags' },
  //     ]
  //   }
  // ];
  // const categories = [
  //   { name: 'Men Fashion', image: 'https://i.imgur.com/Y54Bf8F.png', tag: 'From ₹99', filter: 'Apparel' },
  //   { name: 'Electronics', image: 'https://i.imgur.com/Yoy2u0n.png', tag: 'Upto 80% OFF', filter: 'Electronics' },
  //   { name: 'Bags & Watches', image: 'https://i.imgur.com/pDRvT6P.png', tag: 'Upto 80% OFF', filter: 'Watch' }, // Note: You can add a "Bags" category later
  //   { name: 'Home & Kitchen', image: 'https://i.imgur.com/KxVZeL0.png', tag: 'Upto 80% OFF', filter: 'Groceries' }, // Assuming coffee beans are in this category
  //   { name: 'Beauty & Care', image: 'https://i.imgur.com/k2m3fls.png', tag: 'From ₹49', filter: 'Accessories' }, // Assuming sunglasses/scarf are here
  //   { name: 'Footwear', image: 'https://i.imgur.com/J325Tzg.png', tag: 'Upto 80% OFF', filter: 'Shoes' },
  // ];
  // const [featuredProducts, setFeaturedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [tabProducts, setTabProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('New Arrival');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { addToCart } = useContext(CartContext);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
       try {
        setLoading(true);
        setError('');
        const response = await fetch('http://localhost:5000/api/products');
      
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
      // Sort by newest first using the 'createdAt' timestamp
      sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (activeTab === 'Best Selling' || activeTab === 'Top Rated') {
      // We'll simulate "Best Selling" by sorting by the highest rating
      sortedProducts.sort((a, b) => b.rating - a.rating);
    }

    setTabProducts(sortedProducts.slice(0, 8)); // Display the top 8 products for the selected tab
  }, [activeTab, allProducts]);

  const handleQuickView = (product) => { setSelectedProduct(product); };
  const handleCloseModal = () => { setSelectedProduct(null); };

  return (
    <div className="homepage">
      <HeroSlider />

      <FeaturesBar />

      <section className="category-banners">
        <div className="container">
          <div className="category-banners-grid-new"> {/* Changed class name for new grid */}
            {/* Large Left Banner: Women's Style */}
            <Link to="/shop?category=Apparel" className="main-banner-item">
              <div className="main-banner-content">
                <span className="subtitle">New Arrivals</span>
                <h3>Women's Style</h3>
                <p>Up to 70% Off</p>
                <button className="banner-shop-btn">Shop Now</button>
              </div>
            </Link>

            {/* Right Column with Smaller Banners */}
            <div className="small-banners-column">
              {/* Small Top Banner: Handbag */}
              <Link to="/shop?category=Bags" className="small-banner-item">
                <img src="https://images.pexels.com/photos/1034859/pexels-photo-1034859.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Handbag" />
                <div className="small-banner-content">
                  <span className="discount-badge">25% OFF</span>
                  <h4>Handbag</h4>
                  <span className="shop-now-text">Shop Now <span className="arrow">›</span></span>
                </div>
              </Link>

              {/* Small Top Banner: Watch */}
              <Link to="/shop?category=Watch" className="small-banner-item">
                <img src="https://images.pexels.com/photos/2113994/pexels-photo-2113994.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Watch" />
                <div className="small-banner-content">
                  <span className="discount-badge">45% OFF</span>
                  <h4>Watch</h4>
                  <span className="shop-now-text">Shop Now <span className="arrow">›</span></span>
                </div>
              </Link>

              {/* Small Bottom Banner: Backpack */}
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
          ) : ( <p>Loading products...</p> )}
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
      
       <section className="brands-section">
        <div className="logo-carousel-container">
          <div className="logo-carousel">
            {/* Wrap each image with a Link */}
                <Link to="/shop?brand=Nike"><img src={brand1} alt="Nike" /></Link>
                <Link to="/shop?brand=Adidas"><img src={brand2} alt="Adidas" /></Link>
                <Link to="/shop?brand=Puma"><img src={brand3} alt="Puma" /></Link>
                <Link to="/shop?brand=Levi's"><img src={brand4} alt="Levi's" /></Link>
                {/* <Link to="/shop?brand=The North Face"><img src={brand5} alt="The North Face" /></Link> */}
                {/* Duplicate set for seamless loop */}
                <Link to="/shop?brand=Nike"><img src={brand1} alt="Nike" /></Link>
                <Link to="/shop?brand=Adidas"><img src={brand2} alt="Adidas" /></Link>
                <Link to="/shop?brand=Puma"><img src={brand3} alt="Puma" /></Link>
                <Link to="/shop?brand=Levi's"><img src={brand4} alt="Levi's" /></Link>
                {/* <Link to="/shop?brand=The North Face"><img src={brand5} alt="The North Face" /></Link> */}
           
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
              <div className="product-rating">{'⭐'.repeat(Math.round(selectedProduct.rating))} ({selectedProduct.rating})</div>
              <p className="product-price">${selectedProduct.price.toFixed(2)}</p>
              <p className="product-description">{selectedProduct.description}</p>
              <button onClick={() => { addToCart(selectedProduct); handleCloseModal(); }} className="add-to-cart-btn">
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