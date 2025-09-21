const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/product.model');
const User = require('./models/user.model');

const SELLER_USER_ID = '68cfdf5929882f6250e7cd15';

const productsToSeed = [
  {
    id: 1,
    name: 'Classic Leather Watch',
    price: 150,
    image: 'https://images.pexels.com/photos/2783873/pexels-photo-2783873.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Watch',
    rating: 4.5,
    brand: 'Puma',
    description: 'A timeless classic, this leather watch adds sophistication to any outfit. Features a stainless steel case and genuine leather strap.'
  },
  {
    id: 2,
    name: 'Wireless Bluetooth Headphones',
    price: 99.99,
    image: 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Electronics',
    rating: 4.8,
    brand: 'Sony',
    description: 'Experience immersive sound with these noise-cancelling wireless headphones. Up to 20 hours of battery life.'
  },
  {
    id: 3,
    name: 'Modern Running Shoes',
    price: 120,
    image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Shoes',
    rating: 4.2,
    brand: 'Adidas',
    description: 'Lightweight and comfortable running shoes, perfect for your daily jog or workout sessions. Breathable mesh upper.'
  },
  {
    id: 4,
    name: 'Stylish Sunglasses',
    price: 75,
    image: 'https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Accessories',
    rating: 4.6,
    brand: 'Ray-Ban',
    description: 'Protect your eyes with these stylish UV400 sunglasses. Durable frame and polarized lenses.'
  },
  {
    id: 5,
    name: 'Leather Backpack',
    price: 200,
    image: 'https://images.pexels.com/photos/1545669/pexels-photo-1545669.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Bags',
    rating: 4.7,
    brand: 'Generic Brand',
    description: 'A spacious and durable leather backpack, ideal for work, travel, or school. Multiple compartments for organization.'
  },
  {
    id: 6,
    name: 'Smart Fitness Tracker',
    price: 85,
    image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Electronics',
    rating: 4.3,
    brand: 'Generic Brand',
    description: 'Track your fitness goals with this smart tracker. Monitors heart rate, steps, and sleep patterns. Water-resistant.'
  },
  {
    id: 7,
    name: 'Cozy Wool Scarf',
    price: 45,
    image: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Accessories',
    rating: 4.9,
    brand: 'Generic Brand',
    description: 'Stay warm with this soft and cozy wool scarf. Available in multiple colors.'
  },
  {
    id: 8,
    name: 'Gourmet Coffee Beans',
    price: 25,
    image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Groceries',
    rating: 4.8,
    brand: 'Generic Brand',
    description: 'A 1lb bag of single-origin gourmet coffee beans. Rich aroma and smooth taste.'
  },
  {
    id: 9,
    name: 'Professional Camera Drone',
    price: 999,
    image: 'https://images.pexels.com/photos/3945657/pexels-photo-3945657.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Electronics',
    rating: 4.9,
    brand: 'Generic Brand',
    description: 'Capture stunning aerial shots with this 4K camera drone. Features GPS, auto-return, and a 30-minute flight time.'
  },
  {
    id: 10,
    name: 'Casual Canvas Sneakers',
    price: 60,
    image: 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Shoes',
    rating: 4.0,
    brand: 'Nike',
    description: 'Versatile and comfortable canvas sneakers for everyday wear. A wardrobe staple.'
  },
  {
    name: 'React Infinity Run',
    price: 160,
    description: 'Designed to help reduce injury and keep you on the run.',
    image: 'https://images.pexels.com/photos/10333235/pexels-photo-10333235.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Shoes',
    rating: 4.5,
    brand: 'Nike',
  },
  {
    name: 'Ultraboost 22',
    price: 180,
    description: 'Experience incredible energy return with these comfortable sneakers.',
    image: 'https://images.pexels.com/photos/12628400/pexels-photo-12628400.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Shoes',
    rating: 4.8,
    brand: 'Adidas',
  },
  {
    name: 'Tiro 23 Training Jacket',
    price: 65,
    description: 'A slim-fitting jacket made with moisture-absorbing AEROREADY.',
    image: 'https://images.pexels.com/photos/1661471/pexels-photo-1661471.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Apparel',
    rating: 4.6,
    brand: 'Adidas',
  },
  {
    name: 'Essentials Logo Tee',
    price: 25,
    description: 'A comfortable cotton tee for a classic, casual look.',
    image: 'https://images.pexels.com/photos/428338/pexels-photo-428338.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Apparel',
    rating: 4.4,
    brand: 'Puma',
  },
  {
    name: '501 Original Fit Jeans',
    price: 98,
    description: 'The original blue jean since 1873. A timeless icon of American style.',
    image: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Apparel',
    rating: 4.7,
    brand: 'Levi\'s',
  },
  {
    name: 'Retro Digital Watch',
    price: 60,
    description: 'A reliable and stylish digital watch with a vintage feel.',
    image: 'https://images.pexels.com/photos/2113994/pexels-photo-2113994.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Watch',
    rating: 4.3,
    brand: 'Casio',
  },

  // == Men Fashion (Category: Apparel) ==
  {
    name: 'Men\'s Formal Cotton Shirt',
    price: 45,
    description: 'A classic regular-fit formal shirt made from 100% premium cotton for all-day comfort.',
    image: 'https://images.pexels.com/photos/5212320/pexels-photo-5212320.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Apparel',
    rating: 4.8,
    brand: 'Van Heusen',
  },
  {
    name: 'Men\'s Ethnic Kurta Set',
    price: 60,
    description: 'Elegant and stylish Kurta-Pajama set for festive occasions. Made from a comfortable silk blend.',
    image: 'https://images.pexels.com/photos/17616999/pexels-photo-17616999/free-photo-of-a-man-in-a-traditional-indian-outfit.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Apparel',
    rating: 4.9,
    brand: 'Manyavar',
  },
  {
    name: 'Men\'s Bomber Jacket',
    price: 90,
    description: 'A stylish and lightweight bomber jacket, perfect for casual outings and layering.',
    image: 'https://images.pexels.com/photos/1661471/pexels-photo-1661471.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Apparel',
    rating: 4.7,
    brand: 'Zara',
  },

  // == Electronics ==
  {
    name: '55-inch 4K UHD Smart TV',
    price: 550,
    salePrice: 99.99,
    description: 'Experience stunning 4K picture quality with this smart TV, featuring built-in streaming apps.',
    image: 'https://images.pexels.com/photos/5721865/pexels-photo-5721865.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Electronics',
    rating: 4.9,
    brand: 'Samsung',
  },
  {
    name: 'True Wireless Earbuds',
    price: 120,
    description: 'Noise-cancelling true wireless earbuds with up to 24 hours of battery life with the charging case.',
    image: 'https://images.pexels.com/photos/7862601/pexels-photo-7862601.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Electronics',
    rating: 4.8,
    brand: 'Sony',
  },
  {
    name: 'Ultra-Thin Laptop',
    price: 1200,
    description: 'A powerful and lightweight laptop with a 13-inch display, perfect for work and travel.',
    image: 'https://images.pexels.com/photos/812264/pexels-photo-812264.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Electronics',
    rating: 4.9,
    brand: 'Apple',
  },

  // == Bags & Watches ==
  {
    name: 'Leather Bi-Fold Wallet',
    price: 50,
    description: 'A sleek and durable bi-fold wallet made from genuine leather with multiple card slots.',
    image: 'https://images.pexels.com/photos/932577/pexels-photo-932577.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Bags',
    rating: 4.7,
    brand: 'Tommy Hilfiger',
  },
  {
    name: 'Travel Laptop Backpack',
    price: 85,
    description: 'A spacious and water-resistant backpack with a dedicated laptop compartment and USB charging port.',
    image: 'https://images.pexels.com/photos/1545669/pexels-photo-1545669.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Bags',
    rating: 4.8,
    brand: 'The North Face',
  },
  {
    name: 'Classic Analog Wristwatch',
    price: 150,
    description: 'A timeless analog watch with a stainless steel case and genuine leather strap.',
    image: 'https://images.pexels.com/photos/2783873/pexels-photo-2783873.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Watch',
    rating: 4.6,
    brand: 'Fossil',
  },

  // == Home & Kitchen (Category: Home Goods) ==
  {
    name: 'Non-Stick Cookware Set',
    price: 125,
    description: 'A complete 10-piece non-stick cookware set, including pans, pots, and lids.',
    image: 'https://images.pexels.com/photos/7631326/pexels-photo-7631326.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Home Goods',
    rating: 4.8,
    brand: 'Prestige',
  },
  {
    name: 'Electric Kettle',
    price: 40,
    description: 'A fast-boiling 1.5-liter electric kettle with an automatic shut-off feature for safety.',
    image: 'https://images.pexels.com/photos/8580718/pexels-photo-8580718.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Home Goods',
    rating: 4.7,
    brand: 'Philips',
  },
  {
    name: 'Modern Wooden Bookshelf',
    price: 200,
    description: 'A stylish 5-tier bookshelf perfect for organizing books and displaying decor items.',
    image: 'https://images.pexels.com/photos/159984/bookshelf-book-books-library-159984.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Home Goods',
    rating: 4.9,
    brand: 'Urban Ladder',
  },

  // == Beauty & Care (Category: Accessories) ==
  {
    name: 'Luxury Perfume for Men',
    price: 80,
    description: 'A long-lasting Eau de Parfum with a woody and spicy fragrance profile.',
    image: 'https://images.pexels.com/photos/1255372/pexels-photo-1255372.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Accessories',
    rating: 4.8,
    brand: 'Dior',
  },
  {
    name: 'Complete Skincare Set',
    price: 110,
    description: 'A 5-step skincare routine set including a cleanser, toner, serum, moisturizer, and sunscreen.',
    image: 'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Accessories',
    rating: 4.9,
    brand: 'The Body Shop',
  },
  {
    name: 'Professional Hair Dryer',
    price: 55,
    description: 'A powerful 2000W hair dryer with multiple heat and speed settings for fast drying.',
    image: 'https://images.pexels.com/photos/973401/pexels-photo-973401.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Accessories',
    rating: 4.7,
    brand: 'Dyson',
  },

  // == Footwear (Category: Shoes) ==
  {
    name: 'Men\'s Leather Loafers',
    price: 100,
    description: 'Classic penny loafers crafted from genuine leather, perfect for smart-casual wear.',
    image: 'https://images.pexels.com/photos/267202/pexels-photo-267202.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Shoes',
    rating: 4.8,
    brand: 'Clarks',
  },
  {
    name: 'Unisex Running Sneakers',
    price: 120,
    description: 'Lightweight and responsive running sneakers with maximum cushioning for long distances.',
    image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Shoes',
    rating: 4.9,
    brand: 'Nike',
  },
  {
    name: 'Classic Suede Sneakers',
    price: 70,
    description: 'The iconic PUMA Suede, a footwear classic for all time, updated with modern comfort.',
    image: 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Shoes',
    rating: 4.7,
    brand: 'Puma',
  },

];

const importData = async () => {
  try {
    const uri = process.env.MONGO_URI;
    await mongoose.connect(uri);
    console.log("DB connected for seeding.");

    const seller = await User.findById(SELLER_USER_ID);
    if (!seller) {
      console.error('Error: Seller user not found. Please check the SELLER_USER_ID.');
      process.exit(1);
    }
    
    // Add the seller's ID to every product
    const productsWithSeller = productsToSeed.map(product => ({
      ...product,
      seller: seller._id,
    }));
    await Product.deleteMany(); // Clear existing products
    console.log("Old products cleared.");
    
    await Product.insertMany(productsWithSeller); // Insert new products
    console.log('Data Imported Successfully! ✅');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();