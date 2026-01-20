import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import Header from './components/common/Header';
import Dashboard from './pages/Dashboard';
import CreateRFP from './pages/CreateRFP';
import RFPManagement from './pages/RFPManagement';
import RFPDetails from './pages/RFPDetails';
import SendRFP from './pages/SendRFP';
import ProposalComparison from './pages/ProposalComparison';
import VendorManagement from './pages/VendorManagement';
import VendorForm from './pages/VendorForm';

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/rfps" element={<RFPManagement />} />
                <Route path="/rfps/create" element={<CreateRFP />} />
                <Route path="/rfps/:id" element={<RFPDetails />} />
                <Route path="/rfps/:id/send" element={<SendRFP />} />
                <Route path="/rfps/:id/proposals" element={<ProposalComparison />} />
                <Route path="/vendors" element={<VendorManagement />} />
                <Route path="/vendors/new" element={<VendorForm />} />
                <Route path="/vendors/:id/edit" element={<VendorForm />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;

