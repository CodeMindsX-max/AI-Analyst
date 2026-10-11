import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MailCheck, CheckCircle } from 'lucide-react';

export function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <Card className="p-8 text-center space-y-4 shadow-md border-slate-200">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <MailCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Email Verification (Demo)</h1>
          <p className="text-xs text-slate-500">
            In development and demo mode, email addresses are automatically verified. No external SMTP or SendGrid provider is required.
          </p>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-800 text-xs flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Account email pre-verified for local workspace.</span>
          </div>
          <Link to="/overview" className="inline-block w-full">
            <Button className="w-full">Proceed to Dashboard</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
