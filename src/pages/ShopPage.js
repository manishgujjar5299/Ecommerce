import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Modal from '../components/Modal';
import { CartContext } from '../context/CartContext';
import './ShopPage.css';
// import './ProductDetailPage.css';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const ShopPage = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [category, setCategory] = useState('All');
  const [brand, setBrand] = useState('All'); // <-- New state for brand filter
  const [sortBy, setSortBy] = useState('default');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { addToCart } = useContext(CartContext);
  
  const query = useQuery();
  const searchTerm = query.get('search') || '';
  const brandFromURL = query.get('brand') || 'All';
  const categoryFromURL = query.get('category') || 'All';

  // Set the brand filter from the URL when the page loads
  useEffect(() => {
    setBrand(brandFromURL);
    setCategory(categoryFromURL);
  }, [brandFromURL, categoryFromURL]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products');
        const data = await response.json();
        setAllProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = [...allProducts];

    // Search term filtering
    if (searchTerm) {
      result = result.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    // Category filtering
    if (category !== 'All') {
      result = result.filter(p => p.category === category);
    }
    // Brand filtering (NEW)
    if (brand !== 'All') {
      result = result.filter(p => p.brand === brand);
    }
    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating-desc') {
      result.sort((a, b) => b.rating - a.rating);
    }

    setFilteredProducts([...result]);
  }, [category, brand, sortBy, searchTerm, allProducts]); // <-- Add 'brand' to dependency array

  const handleQuickView = (product) => { setSelectedProduct(product); };
  const handleCloseModal = () => { setSelectedProduct(null); };

  const allCategories = ['All', ...new Set(allProducts.map(p => p.category))];
  const allBrands = ['All', ...new Set(allProducts.map(p => p.brand))]; // <-- Get all unique brands

  return (
    <div className="shop-page container">
      <h1>Shop All Products</h1>
      <div className="filters">
        {/* Category Filter */}
        <div className="filter-group">
          <label htmlFor="category">Category:</label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
            {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        {/* Brand Filter (NEW) */}
        <div className="filter-group">
          <label htmlFor="brand">Brand:</label>
          <select id="brand" value={brand} onChange={(e) => setBrand(e.target.value)}>
            {allBrands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        {/* Sort By Filter */}
        <div className="filter-group">
          <label htmlFor="sort">Sort By:</label>
          <select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="default">Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating-desc">Rating: High to Low</option>
          </select>
        </div>
      </div>
      <div className="product-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <ProductCard 
              key={product._id}
              product={product} 
              onQuickViewClick={handleQuickView}
            />
          ))
        ) : ( <p>Loading products or no products found for this brand...</p> )}
      </div>

      <Modal isOpen={!!selectedProduct} onClose={handleCloseModal}>

        {selectedProduct && (

           <div className="product-detail-layout">

           <div className="product-detail-image">

             <img src={selectedProduct.image} alt={selectedProduct.name} />

           </div>

           <div className="product-detail-info">

             <h1>{selectedProduct.name}</h1>

             <div className="product-rating">

               {'⭐'.repeat(Math.round(selectedProduct.rating))} ({selectedProduct.rating})

             </div>

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

export default ShopPage;