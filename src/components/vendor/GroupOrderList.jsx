import React, { useState, useEffect, useMemo } from 'react';
import { MagnifyingGlassIcon, UserGroupIcon, ClockIcon, TagIcon, UserIcon, XMarkIcon, InboxIcon } from '@heroicons/react/24/outline';
import { format, formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useGroupOrders } from '../../hooks/useGroupOrders';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const GroupOrderList = ({ filterType = 'open' }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { groupOrders, loading, error, fetchGroupOrders, joinGroupOrder } = useGroupOrders();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(filterType === 'myOrders' ? '' : 'open');
  const [sortBy, setSortBy] = useState('deadline');
  const [joinLoading, setJoinLoading] = useState(null);
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    fetchGroupOrders(filterType);
  }, [filterType, fetchGroupOrders]);

  const handleJoinOrder = async (groupOrderId) => {
    setJoinLoading(groupOrderId);
    setJoinError('');
    try {
      await joinGroupOrder(groupOrderId);
      await fetchGroupOrders(filterType);
    } catch (err) {
      setJoinError(err.message || 'Failed to join group order');
    } finally {
      setJoinLoading(null);
    }
  };

  const handleViewDetails = (groupOrderId) => {
    navigate(`/vendor/group-orders/${groupOrderId}`);
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-green-100 text-green-800',
      closed: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      fulfilled: 'bg-blue-100 text-blue-800',
      default: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors.default;
  };

  const getTimeRemaining = (deadline) => {
    const deadlineDate = deadline?.toDate ? deadline.toDate() : new Date(deadline);
    if (deadlineDate < new Date()) return 'Expired';
    return formatDistanceToNow(deadlineDate, { addSuffix: true });
  };

  const calculateSavings = (order) => {
    if (!order.currentDiscount) return 0;
    return (order.totalValue * order.currentDiscount / 100).toFixed(2);
  };

  const filteredAndSortedOrders = useMemo(() => {
    return groupOrders
      .filter(order => {
        const searchLower = searchTerm.toLowerCase();
        const titleMatch = order.title.toLowerCase().includes(searchLower);
        const descriptionMatch = order.description?.toLowerCase().includes(searchLower);
        const statusMatch = !statusFilter || order.status === statusFilter;
        return (titleMatch || descriptionMatch) && statusMatch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'deadline':
            const dateA = a.deadline?.toDate ? a.deadline.toDate() : new Date(a.deadline);
            const dateB = b.deadline?.toDate ? b.deadline.toDate() : new Date(b.deadline);
            return dateA - dateB;
          case 'members':
            return b.memberIDs.length - a.memberIDs.length;
          case 'value':
            return b.totalValue - a.totalValue;
          default:
            return 0;
        }
      });
  }, [groupOrders, searchTerm, statusFilter, sortBy]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      );
    }

    if (error) {
      return <ErrorMessage message={error} onRetry={() => fetchGroupOrders(filterType)} />;
    }

    if (filteredAndSortedOrders.length === 0) {
      return (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <InboxIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-xl font-medium text-gray-900">No Group Orders Found</h2>
          <p className="mt-2 text-gray-500">
            {filterType === 'open'
              ? 'No open group orders match your criteria. Try adjusting the filters or check back later.'
              : 'You haven\'t joined any group orders yet. Explore open orders to get started!'}
          </p>
        </div>
      );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedOrders.map((order) => {
                const isLeader = order.leaderID === user?.uid;
                const isMember = order.memberIDs.includes(user?.uid);
                const canJoin = order.status === 'open' && !isMember;
                const savings = calculateSavings(order);

                return (
                <div key={order.id} className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col group transform hover:-translate-y-1 transition-transform duration-300">
                    <div className="p-5 flex-grow">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{order.title}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                        </span>
                    </div>

                    {order.description && <p className="text-sm text-gray-600 mb-4 h-10 overflow-hidden">{order.description}</p>}

                    <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex items-center"><UserIcon className="h-4 w-4 mr-2 text-gray-400" /><span>Leader: {order.leaderName}{isLeader && ' (You)'}</span></div>
                        <div className="flex items-center"><UserGroupIcon className="h-4 w-4 mr-2 text-gray-400" /><span>{order.memberIDs.length} {order.memberIDs.length === 1 ? 'member' : 'members'}</span></div>
                        <div className="flex items-center"><ClockIcon className="h-4 w-4 mr-2 text-gray-400" /><span>{order.status === 'open' ? `Ends ${getTimeRemaining(order.deadline)}` : `Closed on ${format(order.deadline.toDate(), 'MMM dd')}`}</span></div>
                        <div className="flex items-center"><TagIcon className="h-4 w-4 mr-2 text-gray-400" /><span>Total Value: ₹{order.totalValue?.toFixed(2) || '0.00'}</span>{savings > 0 && <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">Save {order.currentDiscount}%</span>}</div>
                    </div>
                    </div>

                    <div className="p-4 bg-gray-50 border-t flex items-center gap-3">
                    {canJoin ? (
                        <>
                        <button onClick={() => handleJoinOrder(order.id)} disabled={joinLoading === order.id} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 transition-colors">
                            {joinLoading === order.id ? 'Joining...' : 'Quick Join'}
                        </button>
                        <button onClick={() => handleViewDetails(order.id)} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                            View Details
                        </button>
                        </>
                    ) : (
                        <button onClick={() => handleViewDetails(order.id)} className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                        {isLeader ? 'Manage Order' : 'View Details'}
                        </button>
                    )}
                    </div>
                </div>
                );
            })}
        </div>
    );
  };

  return (
    <div className="p-4 sm:p-6">
      {joinError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {joinError}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setJoinError('')}>
            <XMarkIcon className="h-6 w-6 text-red-500" />
          </span>
        </div>
      )}

      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="cancelled">Cancelled</option>
            <option value="fulfilled">Fulfilled</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          >
            <option value="deadline">Sort by Deadline</option>
            <option value="members">Sort by Members</option>
            <option value="value">Sort by Total Value</option>
          </select>
        </div>
      </div>

      {renderContent()}
    </div>
  );
};

export default GroupOrderList;
