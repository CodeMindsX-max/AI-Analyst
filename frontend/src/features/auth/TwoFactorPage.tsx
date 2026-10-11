import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/app/providers';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ShieldCheck } from 'lucide-react';

export function TwoFactorPage() {
  const [code, setCode] = useState('123456');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast('2FA Verified', 'Authentication successful (Demo verification)', 'success');
      navigate('/overview');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <Card className="p-8 text-center space-y-4 shadow-md border-slate-200">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Two-Factor Authentication</h1>
          <p className="text-xs text-slate-500">
            Enter the 6-digit confirmation code from your authenticator app (Demo pre-filled with 123456).
          </p>

          <form onSubmit={handleVerify} className="space-y-4 pt-2">
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="text-center tracking-widest text-2xl font-mono font-bold w-full py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button type="submit" loading={loading} className="w-full">
              Confirm & Continue
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
