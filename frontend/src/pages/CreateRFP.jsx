import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RFPCreationChat from '../components/rfp/RFPCreationChat';
import RFPStructuredView from '../components/rfp/RFPStructuredView';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { createRFPFromText, saveRFP } from '../services/rfpService';

const CreateRFP = () => {
    const navigate = useNavigate();
    const [generatedRFP, setGeneratedRFP] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleRFPGenerated = async (naturalLanguageInput) => {
        setLoading(true);
        setError(null);

        try {
            const rfp = await createRFPFromText(naturalLanguageInput);
            setGeneratedRFP(rfp);
        } catch (err) {
            setError(err.error || err.message || 'Failed to generate RFP');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (rfpData) => {
        setLoading(true);
        setError(null);

        try {
            await saveRFP(rfpData);
            setSuccess(true);
            setTimeout(() => {
                navigate('/rfps');
            }, 1500);
        } catch (err) {
            setError(err.error || err.message || 'Failed to save RFP');
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setGeneratedRFP(null);
    };

    return (
        <div className="px-6 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Create New RFP</h1>
                <p className="text-gray-600">
                    Use AI to generate a structured RFP from your natural language description
                </p>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative">
                    <span className="block sm:inline">{error}</span>
                    <button
                        onClick={() => setError(null)}
                        className="absolute top-0 bottom-0 right-0 px-4 py-3"
                    >
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>
            )}

            {loading ? (
                <LoadingSpinner message="Processing your request..." />
            ) : (
                <>
                    <RFPCreationChat onRFPGenerated={handleRFPGenerated} />

                    {generatedRFP && (
                        <RFPStructuredView
                            rfpData={generatedRFP}
                            onSave={handleSave}
                            onCancel={handleCancel}
                        />
                    )}
                </>
            )}

            {success && (
                <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
                    RFP created successfully!
                </div>
            )}
        </div>
    );
};

export default CreateRFP;
