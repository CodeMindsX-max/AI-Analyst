import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '@/app/providers';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast('Reset requested', `Recovery email simulated for ${email}`, 'info');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reset Password</h1>
          <p className="text-xs text-slate-500 mt-1">Enter your email address to receive password recovery instructions</p>
        </div>

        <Card className="p-6 shadow-md border-slate-200">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="demo@analystai.local"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <Button type="submit" loading={loading} className="w-full" size="lg">
                Send Reset Instructions
              </Button>
            </form>
          ) : (
            <div className="text-center py-4 space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-900">Recovery Instructions Sent</h3>
              <p className="text-xs text-slate-500">
                In demo mode, your request is acknowledged. In production, a secure cryptographic token is dispatched via email.
              </p>
              <Link to="/reset-password?token=demo-token" className="inline-block text-xs text-blue-600 font-semibold hover:underline mt-2">
                Simulate clicking reset link &rarr;
              </Link>
            </div>
          )}

          <div className="mt-5 pt-3 border-t border-slate-100 text-center text-xs">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
