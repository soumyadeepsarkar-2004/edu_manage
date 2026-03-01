import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const TwoFactorVerify = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { completeTwoFactorLogin } = useAuth();
  const [totpCode, setTotpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // The temp token is passed via location state
  const tempToken = new URLSearchParams(window.location.search).get('t') || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!totpCode || totpCode.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }
    if (!tempToken) {
      toast.error('Session expired. Please log in again.');
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      const result = await completeTwoFactorLogin(tempToken, totpCode);
      if (result.success) {
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <ShieldCheckIcon className="mx-auto h-12 w-12 text-primary-600" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">{t('auth.twoFactor.title')}</h2>
          <p className="mt-2 text-sm text-gray-600">{t('auth.twoFactor.subtitle')}</p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.twoFactor.code')}
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="block w-full text-center text-3xl tracking-widest border border-gray-300 rounded-lg py-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || totpCode.length !== 6}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Verifying...' : t('auth.twoFactor.verify')}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorVerify;
