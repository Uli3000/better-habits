import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, UserPlus, Eye } from 'lucide-react';

const Auth = () => {
  const { user, loading, signIn, signUp, enterGuestMode } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
    } else {
      const { error } = await signUp(email, password);
      if (error) {
        setError(error.message);
      } else {
        setMessage('¡Cuenta creada! Revisa tu email para confirmar tu cuenta.');
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-foreground">
            Better <span className="text-primary">Habits</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {isLogin ? 'Inicia sesión para continuar' : 'Crea tu cuenta'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
              minLength={6}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>

          {error && (
            <p className="text-destructive text-sm text-center bg-destructive/10 p-3 rounded-xl">{error}</p>
          )}
          {message && (
            <p className="text-accent text-sm text-center bg-accent/10 p-3 rounded-xl">{message}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
              </>
            )}
          </button>
        </form>

        <button
          onClick={() => { setIsLogin(!isLogin); setError(''); setMessage(''); }}
          className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
        >
          {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground">o</span></div>
        </div>

        <button
          onClick={() => { enterGuestMode(); navigate('/'); }}
          className="w-full py-3 rounded-xl border border-border text-foreground font-medium flex items-center justify-center gap-2 hover:bg-secondary transition-colors text-sm"
        >
          <Eye size={18} />
          Probar sin cuenta
        </button>
        <p className="text-xs text-muted-foreground text-center mt-2">Los datos se guardan solo en este navegador</p>
      </div>
    </div>
  );
};

export default Auth;
