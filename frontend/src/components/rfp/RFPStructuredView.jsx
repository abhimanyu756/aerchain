import React, { useState, useEffect } from 'react';

const RFPStructuredView = ({ rfpData, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        budget: '',
        currency: 'USD',
        delivery_deadline: '',
        payment_terms: '',
        warranty_requirements: '',
        items: [],
        additional_requirements: '',
    });

    useEffect(() => {
        if (rfpData) {
            setFormData({
                title: rfpData.title || '',
                description: rfpData.description || '',
                budget: rfpData.budget || '',
                currency: rfpData.currency || 'USD',
                delivery_deadline: rfpData.delivery_deadline ? new Date(rfpData.delivery_deadline).toISOString().split('T')[0] : '',
                payment_terms: rfpData.payment_terms || '',
                warranty_requirements: rfpData.warranty_requirements || '',
                items: rfpData.items || [],
                additional_requirements: rfpData.additional_requirements || '',
            });
        }
    }, [rfpData]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData((prev) => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData((prev) => ({
            ...prev,
            items: [...prev.items, { name: '', quantity: '', specifications: '' }],
        }));
    };

    const removeItem = (index) => {
        setFormData((prev) => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = () => {
        if (!formData.title || !formData.description || formData.items.length === 0) {
            alert('Please fill in title, description, and at least one item');
            return;
        }
        onSave(formData);
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-2xl font-bold mb-2">Review & Edit RFP</h2>
            <p className="text-gray-600 text-sm mb-6">
                Review the AI-generated RFP and make any necessary edits before saving.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">RFP Title *</label>
                    <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        required
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                    <input
                        type="number"
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.budget}
                        onChange={(e) => handleChange('budget', e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.currency}
                        onChange={(e) => handleChange('currency', e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Deadline</label>
                    <input
                        type="date"
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.delivery_deadline}
                        onChange={(e) => handleChange('delivery_deadline', e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                    <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.payment_terms}
                        onChange={(e) => handleChange('payment_terms', e.target.value)}
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Requirements</label>
                    <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.warranty_requirements}
                        onChange={(e) => handleChange('warranty_requirements', e.target.value)}
                    />
                </div>

                <div className="md:col-span-2">
                    <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Items</h3>
                            <button
                                onClick={addItem}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Item
                            </button>
                        </div>

                        {formData.items.map((item, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4 mb-3">
                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                                    <div className="sm:col-span-4">
                                        <input
                                            type="text"
                                            placeholder="Item Name"
                                            className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={item.name}
                                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <input
                                            type="number"
                                            placeholder="Quantity"
                                            className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                        />
                                    </div>
                                    <div className="sm:col-span-5">
                                        <input
                                            type="text"
                                            placeholder="Specifications"
                                            className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={item.specifications}
                                            onChange={(e) => handleItemChange(index, 'specifications', e.target.value)}
                                        />
                                    </div>
                                    <div className="sm:col-span-1 flex items-center">
                                        <button
                                            onClick={() => removeItem(index)}
                                            className="text-red-600 hover:text-red-800 p-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {formData.items.length === 0 && (
                            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
                                No items added yet. Click "Add Item" to add items to this RFP.
                            </div>
                        )}
                    </div>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Requirements</label>
                    <textarea
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        value={formData.additional_requirements}
                        onChange={(e) => handleChange('additional_requirements', e.target.value)}
                    />
                </div>

                <div className="md:col-span-2 flex gap-3 justify-end pt-4">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        Save RFP
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RFPStructuredView;
