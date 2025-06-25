
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import LoginForm from '@/components/LoginForm';
import Modal from '@/components/Modal';
import { useLanguage } from '@/contexts/LanguageContext';

const Login = () => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock authentication logic
      if (email === 'demo@example.com' && password === 'password') {
        setModalType('success');
        setShowModal(true);
        // In a real app, you would store the token and redirect
        localStorage.setItem('authToken', 'mock-token');
      } else {
        setModalType('error');
        setShowModal(true);
      }
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
          <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        type={modalType}
        title={modalType === 'success' ? 'Login Successful' : 'Login Failed'}
        message={
          modalType === 'success' 
            ? 'Welcome back! You have been successfully logged in.'
            : 'Invalid email or password. Please try again.'
        }
      />
    </div>
  );
};

export default Login;
