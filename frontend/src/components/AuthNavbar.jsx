import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

function AuthNavbar({ activePage }) {
  const linkClassName = (page) => (
    `rounded-lg px-2.5 py-2 text-sm font-medium transition-colors hover:bg-teal-50 hover:text-teal-700 ${
      activePage === page ? 'bg-teal-100 text-teal-700' : 'text-foreground/80'
    }`
  );

  return (
    <header className="absolute inset-x-0 top-0 z-10 px-3 pt-3 sm:px-6">
      <nav className="mx-auto flex h-16 max-w-[1440px] items-center justify-between rounded-2xl border border-border/80 bg-card/95 px-4 shadow-sm backdrop-blur sm:px-5">
        <Link to="/calculator" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight text-teal-800">
          <ShieldCheck className="size-5 text-teal-600" />
          <span className="hidden text-lg md:inline">Insurance Platform</span>
        </Link>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <Link to="/about" className={linkClassName('about')}>
            О нас
          </Link>
          <Link to="/calculator" className={linkClassName('calculator')}>
            Калькулятор
          </Link>
          <Link to="/login" className={linkClassName('login')}>
            Войти
          </Link>
          <Link to="/register" className={linkClassName('register')}>
            Регистрация
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default AuthNavbar;
