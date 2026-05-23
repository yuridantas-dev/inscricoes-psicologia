import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, User, Mail, Phone, Hash, Award, Smile, X } from 'lucide-react';
import { PSYCHOLOGY_SUBFIELDS, ROLE_LABELS } from '../types';
import { parseJsonResponse } from '../lib/api';

export default function RegistrationForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [role, setRole] = useState('student');
  const [courseTopic, setCourseTopic] = useState(PSYCHOLOGY_SUBFIELDS[0]);
  
  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const closeSuccessModal = () => setSuccessMsg(null);

  useEffect(() => {
    if (!successMsg) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSuccessModal();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [successMsg]);

  // Simple formatting for Phone (WhatsApp) (XX) XXXXX-XXXX
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    // Format
    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    setPhone(value);
  };

  // Simple CPF/Matrícula clean formatting (numeric and dashes)
  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (value.length > 20) value = value.slice(0, 20);
    setIdentifier(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Basic Validation
    if (!fullName.trim()) {
      setErrorMsg("O nome completo é obrigatório para a emissão do certificado.");
      return;
    }
    if (fullName.trim().split(" ").length < 2) {
      setErrorMsg("Por favor, digite seu nome e sobrenome completo (para o certificado).");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Insira um endereço de e-mail válido.");
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      setErrorMsg("Por favor, insira um número de telefone/WhatsApp válido.");
      return;
    }
    if (!identifier.trim()) {
      setErrorMsg("Matrícula ou CPF é obrigatório.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/inscricao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          identifier: identifier.trim(),
          role,
          courseTopic,
        }),
      });

      const data = await parseJsonResponse<{ error?: string; message?: string }>(response);

      if (!response.ok) {
        throw new Error(data.error || "Erro ao realizar inscrição.");
      }

      setSuccessMsg(
        data.message || "Inscrição enviada! A comissão receberá seus dados por e-mail."
      );
      
      // Clear form
      setFullName('');
      setEmail('');
      setPhone('');
      setIdentifier('');
      setRole('student');
      setCourseTopic(PSYCHOLOGY_SUBFIELDS[0]);

    } catch (err: any) {
      setErrorMsg(err.message || "Erro de conexão com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <AnimatePresence>
      {successMsg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-modal-title"
        >
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] cursor-pointer"
            onClick={closeSuccessModal}
            aria-label="Fechar"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 sm:p-8 text-center"
            id="success-modal"
          >
            <button
              type="button"
              onClick={closeSuccessModal}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <CheckCircle className="w-9 h-9 text-emerald-600" />
            </div>

            <h3
              id="success-modal-title"
              className="text-xl font-bold text-slate-800 mb-2"
            >
              Inscrição confirmada!
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed">
              {successMsg}
            </p>
            <p className="text-sm text-emerald-700 mt-2">
              A organização foi notificada por e-mail. Você pode fechar esta página.
            </p>

            <button
              type="button"
              onClick={closeSuccessModal}
              className="mt-6 w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors cursor-pointer text-sm shadow-md shadow-brand-600/15"
            >
              Entendi
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8"
      id="registration-container"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <Smile className="w-6 h-6 text-brand-600" />
          Ficha de Inscrição Oficial
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Por favor, preencha as informações abaixo com atenção. Seus dados serão utilizados para gerar seu <strong className="text-brand-700 font-medium">Certificado de Participação</strong>.
        </p>
      </div>

      {errorMsg && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 flex gap-3 text-sm items-start"
          id="error-alert"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Atenção</p>
            <p className="text-rose-700/95 mt-0.5">{errorMsg}</p>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center justify-between">
            <span>Nome Completo (Sem abreviações)*</span>
            <span className="text-xs text-brand-600 font-medium font-sans">Como impresso no certificado</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </span>
            <input
              type="text"
              required
              placeholder="Ex: Amanda Silva Ramos"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:border-brand-500 focus:outline-hidden transition-all text-sm shadow-2xs"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            E-mail de Contato*
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </span>
            <input
              type="email"
              required
              placeholder="Ex: amanda@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:border-brand-500 focus:outline-hidden transition-all text-sm shadow-2xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Telefone / WhatsApp*
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                placeholder="(00) 00000-0000"
                value={phone}
                onChange={handlePhoneChange}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:border-brand-500 focus:outline-hidden transition-all text-sm shadow-2xs"
              />
            </div>
          </div>

          {/* Identifier (CPF or RA) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center justify-between">
              <span>Matrícula / CPF*</span>
              <span className="text-xs text-slate-400">Doc oficial</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Hash className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                placeholder="Ex: RA-102938 ou CPF"
                value={identifier}
                onChange={handleIdentifierChange}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:border-brand-500 focus:outline-hidden transition-all text-sm shadow-2xs"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Categoria / Vínculo
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:outline-hidden transition-all text-sm shadow-2xs cursor-pointer"
            >
              {Object.entries(ROLE_LABELS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          {/* Psychology Area/Topic */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Área de Interesse Principal
            </label>
            <select
              value={courseTopic}
              onChange={(e) => setCourseTopic(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:outline-hidden transition-all text-sm shadow-2xs cursor-pointer"
            >
              {PSYCHOLOGY_SUBFIELDS.map((field) => (
                <option key={field} value={field}>
                  {field}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-semibold rounded-xl transition-all shadow-md shadow-brand-600/15 cursor-pointer flex items-center justify-center gap-2 text-sm"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando dados...
              </>
            ) : (
              <>
                <Award className="w-5 h-5" />
                Confirmar Minha Inscrição para Certificado
              </>
            )}
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 pt-1 text-center">
          <span>Seus dados serão enviados por e-mail à comissão organizadora</span>
        </div>
      </form>
    </motion.div>
    </>
  );
}
