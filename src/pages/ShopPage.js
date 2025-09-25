import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';
import { CartContext } from '../context/CartContext';
import './ShopPage.css';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const ShopPage = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [category, setCategory] = useState('All');
  const [brand, setBrand] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // Added local search state
  
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const query = useQuery();
  const urlSearchTerm = query.get('search') || '';
  const brandFromURL = query.get('brand') || 'All';
  const categoryFromURL = query.get('category') || 'All';

  // Set initial filters from URL
  useEffect(() => {
    setBrand(brandFromURL);
    setCategory(categoryFromURL);
    setSearchTerm(urlSearchTerm); // Set search term from URL
  }, [brandFromURL, categoryFromURL, urlSearchTerm]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch('http://localhost:5000/api/products');

        if (!response.ok) {
          throw new Error(`Error ${response.status}: Failed to fetch products`);
        }

        const data = await response.json();
        setAllProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setError(error.message || 'Failed to load products. Please try again later.');
      } finally { 
        setLoading(false); 
      }
    };
    fetchProducts();
  }, []);

  // Filter and sort products
  useEffect(() => {
    let result = [...allProducts];

    // Search term filtering (use URL search term for filtering)
    if (urlSearchTerm) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(urlSearchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(urlSearchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(urlSearchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(urlSearchTerm.toLowerCase())
      );
    }
    
    // Category filtering
    if (category !== 'All') {
      result = result.filter(p => p.category === category);
    }
    
    // Brand filtering
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
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredProducts([...result]);
  }, [category, brand, sortBy, urlSearchTerm, allProducts]);

  // Fixed: Handle filter changes with proper URL updates
  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    updateURLParams({ category: newCategory === 'All' ? null : newCategory });
  };

  const handleBrandChange = (newBrand) => {
    setBrand(newBrand);
    updateURLParams({ brand: newBrand === 'All' ? null : newBrand });
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    updateURLParams({ sort: newSort === 'default' ? null : newSort });
  };

  // Fixed: Clear search with proper URL update
  const clearSearch = () => {
    setSearchTerm('');
    updateURLParams({ search: null });
  };

  // Helper function to update URL parameters
  const updateURLParams = (updates) => {
    const currentParams = new URLSearchParams(location.search);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        currentParams.delete(key);
      } else {
        currentParams.set(key, value);
      }
    });

    const newSearch = currentParams.toString();
    const newPath = newSearch ? `${location.pathname}?${newSearch}` : location.pathname;
    
    navigate(newPath, { replace: true });
  };

  const handleQuickView = (product) => { 
    setSelectedProduct(product); 
  };
  
  const handleCloseModal = () => { 
    setSelectedProduct(null); 
  };

  const retryFetch = () => {
    window.location.reload();
  };

  if (loading) {
    return <LoadingSpinner message='Loading products...' />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={retryFetch} />;
  }

  const allCategories = ['All', ...new Set(allProducts.map(p => p.category))];
  const allBrands = ['All', ...new Set(allProducts.map(p => p.brand))];

  return (
    <div className="shop-page container">
      <div className="page-header">
        <h1>Shop All Products</h1>
        {urlSearchTerm && (
          <div className="search-results-info">
            <p>Search results for: "<strong>{urlSearchTerm}</strong>" ({filteredProducts.length} products found)</p>
            <button onClick={clearSearch} className="clear-search-btn">Clear Search</button>
          </div>
        )}
      </div>
      
      <div className="filters">
        <div className="filter-group">
          <label htmlFor="category">Category:</label>
          <select 
            id="category" 
            value={category} 
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="brand">Brand:</label>
          <select 
            id="brand" 
            value={brand} 
            onChange={(e) => handleBrandChange(e.target.value)}
          >
            {allBrands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="sort">Sort By:</label>
          <select 
            id="sort" 
            value={sortBy} 
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="default">Default</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating-desc">Rating: High to Low</option>
          </select>
        </div>
      </div>

      <div className="results-summary">
        <p>Showing {filteredProducts.length} of {allProducts.length} products</p>
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
        ) : (
          <div className="no-products">
            <p>No products found matching your criteria.</p>
            <button onClick={clearSearch} className="clear-filters-btn">Clear All Filters</button>
          </div>
        )}
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
                {'★'.repeat(Math.round(selectedProduct.rating))} ({selectedProduct.rating})
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