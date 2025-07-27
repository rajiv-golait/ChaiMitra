import React, { useState, useEffect } from 'react';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import ProductCard from '../../components/common/ProductCard';
import CountdownTimer from '../../components/common/CountdownTimer';

const FlashSale = () => {
  const [flashSales, setFlashSales] = useState([]);

  useEffect(() => {
    const fetchFlashSales = async () => {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('salePrice', '!=', null));
      const querySnapshot = await getDocs(q);
      const sales = [];
      querySnapshot.forEach((doc) => {
        sales.push({ id: doc.id, ...doc.data() });
      });
      setFlashSales(sales);
    };

    fetchFlashSales();
  }, []);

  return (
    <div>
      <h2>Flash Sales</h2>
      <div className="flash-sale-container">
        {flashSales.map((sale) => (
          <ProductCard key={sale.id} product={sale}>
            <CountdownTimer endDate={sale.saleEndDate} />
          </ProductCard>
        ))}
      </div>
    </div>
  );
};

export default FlashSale;
