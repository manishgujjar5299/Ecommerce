import React from 'react';
import { Link } from 'react-router-dom';
import './PromoGrid.css';

const PromoGrid = ({ promoData }) => {
  return (
    <div className="promo-grid-container">
      {promoData.map((promo, index) => (
        <div key={index} className="promo-card">
          <div className="promo-card-header">
            <h3>{promo.title}</h3>
            <Link to={promo.link}>See more</Link>
          </div>
          <div className="promo-card-grid">
            {promo.items.map((item, itemIndex) => (
              <Link to={item.link} key={itemIndex} className="promo-item-link">
                <img src={item.image} alt={item.name} />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PromoGrid;