import React, { useState } from 'react';
import { Phone, KeyRound, Loader2, Wheat, ArrowRight } from 'lucide-react';
import { devLogin, sendVerification, verifyCode } from '../api/api';
import toast from 'react-hot-toast';

export default function AuthPage({ onLogin }) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('phone');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!phone) { toast.error('Enter phone number'); return; }
    setLoading(true);
    try {
      await sendVerification(phone);
      setStep('code');
      toast.success('Verification code sent!');
    } catch (error) {
      toast.error('Failed to send code. Check your phone number or try again later.');
    } finally { setLoading(false); }
  };

  const handleVerify = async () => {
    if (!code) { toast.error('Enter verification code'); return; }
    setLoading(true);
    try {
      const res = await verifyCode(phone, code);
      if (res.data.token) { onLogin(res.data.token); toast.success('Welcome to FarmPlus!'); }
    } catch { toast.error('Invalid code'); } finally { setLoading(false); }
  };

  const handleDevLogin = async () => {
    const num = phone || '+919999999999';
    setLoading(true);
    try {
      const res = await devLogin(num);
      if (res.data.token) { onLogin(res.data.token); toast.success('Welcome to FarmPlus!'); }
    } catch (err) { toast.error(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo">
          <div style={{ display:'flex', justifyContent:'center', marginBottom: 16 }}>
            <div style={{ width:56, height:56, borderRadius:'var(--radius-lg)', background:'var(--gradient-green)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Wheat size={28} color="white" />
            </div>
          </div>
          <h1>FarmPlus</h1>
          <p>AI-Powered Crop Yield Prediction</p>
        </div>

        {step === 'phone' ? (
          <>
            <div className="form-group">
              <label className="form-label"><Phone size={14} style={{ marginRight:6 }} />Phone Number</label>
              <input className="form-input" type="tel" placeholder="+919876543210" value={phone}
                onChange={e => setPhone(e.target.value)} />
              <p className="form-hint">E.164 format: +[country][number]</p>
            </div>
            <button className="btn btn-primary btn-lg btn-full" onClick={handleSendCode} disabled={loading}>
              {loading ? <Loader2 size={18} className="spin" /> : <><ArrowRight size={18} /> Send Verification Code</>}
            </button>
          </>
        ) : (
          <>
            <div className="form-group">
              <label className="form-label"><KeyRound size={14} style={{ marginRight:6 }} />Verification Code</label>
              <input className="form-input" type="text" placeholder="Enter 6-digit code" value={code}
                onChange={e => setCode(e.target.value)} maxLength={6} style={{ textAlign:'center', letterSpacing:'0.5em', fontSize:'1.3rem' }} />
            </div>
            <button className="btn btn-primary btn-lg btn-full" onClick={handleVerify} disabled={loading}>
              {loading ? <Loader2 size={18} className="spin" /> : <><KeyRound size={18} /> Verify & Login</>}
            </button>
            <button className="btn btn-ghost btn-full" onClick={() => setStep('phone')} style={{ marginTop:8 }}>
              Change phone number
            </button>
          </>
        )}
        <style>{`.spin { animation: spin 0.8s linear infinite; }`}</style>
      </div>
    </div>
  );
}
