import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ShieldCheckIcon, QrCodeIcon } from '@heroicons/react/24/outline';

const TwoFactorSetup = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState('start'); // 'start' | 'qr' | 'verify' | 'done'
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const startSetup = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post('/api/auth/2fa/setup');
      setQrCode(res.data.qrCode);
      setSecret(res.data.secret);
      setStep('qr');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start 2FA setup');
    } finally {
      setIsLoading(false);
    }
  };

  const enableTwoFactor = async (e) => {
    e.preventDefault();
    if (!token || token.length !== 6) {
      toast.error('Enter the 6-digit code from your authenticator app');
      return;
    }
    setIsLoading(true);
    try {
      await axios.post('/api/auth/2fa/enable', { token });
      toast.success('Two-factor authentication enabled!');
      setStep('done');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-primary-600 px-6 py-4">
        <div className="flex items-center gap-2 text-white">
          <ShieldCheckIcon className="h-6 w-6" />
          <h2 className="text-lg font-semibold">{t('auth.twoFactor.setup')}</h2>
        </div>
      </div>

      <div className="p-6">
        {step === 'start' && (
          <div>
            <p className="text-gray-600 mb-6">
              Add an extra layer of security to your account. You will need an authenticator app
              (Google Authenticator, Authy, etc.) on your phone.
            </p>
            <button
              onClick={startSetup}
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {isLoading ? 'Setting up...' : (
                <>
                  <QrCodeIcon className="h-5 w-5" />
                  Generate QR Code
                </>
              )}
            </button>
          </div>
        )}

        {step === 'qr' && (
          <div>
            <p className="text-sm text-gray-600 mb-4">{t('auth.twoFactor.scanQR')}</p>
            <div className="flex justify-center mb-4">
              <img src={qrCode} alt="2FA QR Code" className="w-48 h-48 border rounded" />
            </div>
            <div className="bg-gray-50 rounded p-3 mb-4">
              <p className="text-xs text-gray-500 mb-1">Manual entry key:</p>
              <code className="text-xs font-mono break-all text-gray-700">{secret}</code>
            </div>
            <p className="text-sm text-gray-600 mb-4">{t('auth.twoFactor.enterCode')}</p>
            <form onSubmit={enableTwoFactor}>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="block w-full text-center text-2xl tracking-widest border border-gray-300 rounded-lg py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
              <button
                type="submit"
                disabled={isLoading || token.length !== 6}
                className="w-full btn-primary"
              >
                {isLoading ? 'Verifying...' : t('auth.twoFactor.verify')}
              </button>
            </form>
          </div>
        )}

        {step === 'done' && (
          <div className="text-center">
            <ShieldCheckIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('auth.twoFactor.enabled')}</h3>
            <p className="text-gray-600 mb-6">
              Your account is now protected with two-factor authentication.
              <br />
              <span className="font-medium text-amber-600">{t('auth.twoFactor.backupAdvice')}</span>
            </p>
            <button onClick={() => navigate('/profile')} className="btn-primary">
              Back to Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSetup;
