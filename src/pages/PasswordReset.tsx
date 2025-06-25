
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import PasswordResetForm from '@/components/forms/PasswordResetForm';
import Modal from '@/components/Modal';
import { useLanguage } from '@/contexts/LanguageContext';

const PasswordReset = () => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');

  const handlePasswordReset = async (email: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setModalType('success');
      setShowModal(true);
    } catch (error) {
      setModalType('error');
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center">
          <PasswordResetForm onSubmit={handlePasswordReset} isLoading={isLoading} />
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        type={modalType}
        title={modalType === 'success' ? t('Reset Link Sent') : t('Error')}
        message={
          modalType === 'success' 
            ? t('Check your email for password reset instructions')
            : t('Failed to send reset link. Please try again.')
        }
      />
    </div>
  );
};

export default PasswordReset;
