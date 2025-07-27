import React, { useState, useEffect } from 'react';
import { getOpenGroupOrders } from '../services/groupOrder';
import GroupOrderList from '../components/vendor/GroupOrderList';

const JoinGroupOrderPage = () => {
  const [groupOrders, setGroupOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroupOrders = async () => {
      try {
        setLoading(true);
        const orders = await getOpenGroupOrders();
        setGroupOrders(orders);
      } catch (err) {
        setError('Failed to fetch group orders. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupOrders();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="page-container">
      <h1>Join a Group Order</h1>
      <GroupOrderList groupOrders={groupOrders} />
    </div>
  );
};

export default JoinGroupOrderPage;

