import {
  Award, ShieldCheck, HeartPulse, Sparkles, HelpCircle, Mail
} from 'lucide-react';
import RegistrationForm from './components/RegistrationForm';

export default function App() {
  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col selection:bg-brand-100 selection:text-brand-900 leading-relaxed font-sans" id="app-root">

      <div className="bg-brand-900 text-brand-100 text-xs py-2 px-4 shadow-inner text-center font-medium font-sans flex items-center justify-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-brand-200 shrink-0" />
        <span>Inscrições abertas para a Turma de Psicologia 2026</span>
      </div>

      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-grow">

        <header className="mb-8 md:mb-12 text-center max-w-2xl mx-auto" id="main-header">
          <img
            src="/logo-faculdade-cci.png"
            alt="Logotipo Faculdade CCI"
            className="h-16 sm:h-20 w-auto mx-auto mb-5 object-contain"
          />

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 border border-brand-100/80 rounded-full text-brand-700 text-xs font-semibold mb-3 tracking-wide uppercase">
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Turma de Psicologia & Saúde</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-800 tracking-tight leading-tight">
            Portal de Inscrições <br />
            <span className="text-brand-600 bg-linear-to-r from-brand-600 to-brand-700 bg-clip-text text-transparent">Psicologia Aplicada</span>
          </h1>

          <p className="text-slate-500 text-sm sm:text-base mt-3 max-w-xl mx-auto">
            Preencha o formulário abaixo. Ao confirmar, a comissão recebe automaticamente um e-mail com seus dados para o certificado.
          </p>
        </header>

        <main className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            <div className="lg:col-span-8">
              <RegistrationForm />
            </div>

            <div className="lg:col-span-4 space-y-4">

              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-brand-600" />
                  Como funciona
                </h3>
                <ul className="text-xs text-slate-500 space-y-2.5">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">1</span>
                    <span>Você preenche e envia o formulário.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">2</span>
                    <span>A organização recebe um e-mail com todos os seus dados.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">3</span>
                    <span>Seu certificado será preparado com o nome exatamente como digitou.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  Sobre o Certificado
                </h3>
                <ul className="text-xs text-slate-500 space-y-2.5">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span><strong>Nome:</strong> use maiúsculas e minúsculas corretamente — será impresso igual no certificado.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span><strong>CPF e e-mail institucional:</strong> devem ser os mesmos cadastrados na faculdade.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-brand-600" />
                  Dúvidas
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <p className="font-semibold text-slate-700">Errei meu nome?</p>
                    <p className="text-slate-500 mt-1">Envie novamente o formulário ou fale com o representante da turma.</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 text-white rounded-2xl p-5 shadow-sm text-center">
                <ShieldCheck className="w-8 h-8 text-brand-400 mx-auto mb-2" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-300">Dados protegidos</h4>
                <p className="text-[11px] text-slate-300 mt-1">
                  Suas informações são enviadas apenas para a comissão organizadora.
                </p>
              </div>

            </div>
          </div>
        </main>
      </div>

      <footer className="bg-white border-t border-slate-100 py-6 px-4 text-center text-xs text-slate-400" id="main-footer">
        <img
          src="/logo-faculdade-cci.png"
          alt=""
          aria-hidden="true"
          className="h-8 w-auto mx-auto mb-2 opacity-70 object-contain"
        />
        <p>© {new Date().getFullYear()} Faculdade CCI — Turma de Psicologia. Todos os direitos reservados.</p>
      </footer>

    </div>
  );
}
