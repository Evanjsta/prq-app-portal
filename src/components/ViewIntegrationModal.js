import React from 'react';

function ViewIntegrationModal({ application, isOpen, onClose }) {
  console.log('🎭 ViewIntegrationModal render:', { isOpen, hasApplication: !!application });

  if (!isOpen || !application) {
    console.log('🎭 Modal NOT showing - isOpen:', isOpen, 'hasApp:', !!application);
    return null;
  }

  console.log('🎭 Modal SHOULD BE VISIBLE NOW');

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="card w-full max-w-2xl">
        <div className="p-6">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Integration Guide - {application.displayName || application.name}
          </h2>
          <p className="text-text-secondary">Integration details coming soon...</p>
          <div className="mt-6">
            <button onClick={onClose} className="btn btn-primary">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewIntegrationModal;
