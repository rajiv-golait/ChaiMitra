// src/features/groupBuying/components/CreateGroupBuyModal.jsx
import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useGroupBuy } from '../context/GroupBuyContext';
import { toast } from 'react-hot-toast';

const CreateGroupBuyModal = ({ isOpen, onClose, product }) => {
  const { createGroupBuy } = useGroupBuy();
  const [targetQuantity, setTargetQuantity] = useState(product?.minOrderQuantity * 10 || 100);
  const [deadline, setDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Set default deadline to 3 days from now
      const defaultDeadline = new Date();
      defaultDeadline.setDate(defaultDeadline.getDate() + 3);
      setDeadline(defaultDeadline.toISOString().slice(0, 16));
      
      if (product?.minOrderQuantity) {
        setTargetQuantity(product.minOrderQuantity * 10);
      }
    }
  }, [isOpen, product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!targetQuantity || targetQuantity < (product?.minOrderQuantity || 1)) {
      toast.error(`Minimum quantity is ${product?.minOrderQuantity || 1}`);
      return;
    }

    if (!deadline || new Date(deadline) < new Date()) {
      toast.error('Please select a future deadline');
      return;
    }

    try {
      setIsSubmitting(true);
      await createGroupBuy(product, targetQuantity, deadline);
      toast.success('Group buy created successfully!');
      onClose();
    } catch (error) {
      console.error('Error creating group buy:', error);
      toast.error(error.message || 'Failed to create group buy');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="div"
                  className="flex justify-between items-center mb-4"
                >
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Start a Group Buy
                  </h3>
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="product"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Product
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="product"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={product?.name || ''}
                        disabled
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="targetQuantity"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Target Quantity ({product?.unit || 'units'})
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        id="targetQuantity"
                        min={product?.minOrderQuantity || 1}
                        value={targetQuantity}
                        onChange={(e) => setTargetQuantity(Number(e.target.value))}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Minimum: {product?.minOrderQuantity || 1} {product?.unit}
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="deadline"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Deadline
                    </label>
                    <div className="mt-1">
                      <input
                        type="datetime-local"
                        id="deadline"
                        value={deadline}
                        min={new Date().toISOString().slice(0, 16)}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>

                  {product?.pricingTiers?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Bulk Pricing Tiers
                      </p>
                      <div className="mt-2 space-y-1 text-sm">
                        {product.pricingTiers
                          .sort((a, b) => a.minQuantity - b.minQuantity)
                          .map((tier, index) => (
                            <div key={index} className="flex justify-between">
                              <span>{tier.minQuantity}+ {product.unit}</span>
                              <span>₹{tier.price} per {product.unit}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Creating...' : 'Create Group Buy'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CreateGroupBuyModal;