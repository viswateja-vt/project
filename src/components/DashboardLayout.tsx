import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  FileImage,
  FolderOpen,
  Home,
  LayoutTemplate,
  LogOut,
  Menu,
  Moon,
  Plus,
  QrCode,
  Settings,
  Sun,
  User,
  X,
} from 'lucide-react';
import {
  NavLink,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  useState,
  type ReactNode,
} from 'react';

import { useAuth } from '../context/AuthContext';
import {
  useTheme,
} from '../context/ThemeContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavigationItem {
  label: string;
  href: string;
  icon: typeof Home;
}

const navigation: NavigationItem[] = [
  {
    label: 'Overview',
    href: '/dashboard',
    icon: Home,
  },
  {
    label: 'My QR Codes',
    href: '/my-qr-codes',
    icon: QrCode,
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    label: 'Templates',
    href: '/templates',
    icon: LayoutTemplate,
  },
];

export function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const {
    user,
    signOut,
  } = useAuth();

  const {
    resolvedTheme,
    toggleTheme,
  } = useTheme();

  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  async function handleSignOut() {
    await signOut();
    navigate('/login', {
      replace: true,
    });
  }

  const pageTitle =
    getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() =>
            setSidebarOpen(false)
          }
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-all duration-200 dark:border-slate-800 dark:bg-slate-900',
          sidebarCollapsed
            ? 'w-[76px]'
            : 'w-[260px]',
          sidebarOpen
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        {/* Brand */}
        <div className="flex h-16 items-center border-b border-slate-200 px-4 dark:border-slate-800">
          <button
            type="button"
            onClick={() =>
              navigate('/dashboard')
            }
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/25">
              <QrCode size={20} />
            </div>

            {!sidebarCollapsed && (
              <div className="min-w-0 text-left">
                <div className="truncate text-sm font-bold tracking-tight">
                  QR Studio
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  QR operating system
                </div>
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Create */}
        <div className="p-3">
          <button
            type="button"
            onClick={() =>
              navigate('/create')
            }
            className={[
              'flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700',
              sidebarCollapsed
                ? 'px-0'
                : '',
            ].join(' ')}
          >
            <Plus size={18} />
            {!sidebarCollapsed && (
              <span>Create QR Code</span>
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {!sidebarCollapsed && (
            <p className="mb-2 px-3 pt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Workspace
            </p>
          )}

          {navigation.map(
            ({
              label,
              href,
              icon: Icon,
            }) => (
              <NavLink
                key={href}
                to={href}
                end={href === '/dashboard'}
                onClick={() =>
                  setSidebarOpen(false)
                }
                className={({ isActive }) =>
                  [
                    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
                    sidebarCollapsed
                      ? 'justify-center px-0'
                      : '',
                  ].join(' ')
                }
                title={
                  sidebarCollapsed
                    ? label
                    : undefined
                }
              >
                <Icon
                  size={18}
                  className="shrink-0"
                />

                {!sidebarCollapsed && (
                  <span>{label}</span>
                )}
              </NavLink>
            )
          )}

          {!sidebarCollapsed && (
            <p className="mb-2 mt-7 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Manage
            </p>
          )}

          <NavLink
            to="/my-qr-codes"
            onClick={() =>
              setSidebarOpen(false)
            }
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
                sidebarCollapsed
                  ? 'justify-center px-0'
                  : '',
              ].join(' ')
            }
            title={
              sidebarCollapsed
                ? 'Folders'
                : undefined
            }
          >
            <FolderOpen
              size={18}
              className="shrink-0"
            />

            {!sidebarCollapsed && (
              <span>Folders & Tags</span>
            )}
          </NavLink>

          <button
            type="button"
            onClick={() =>
              navigate('/templates')
            }
            className={[
              'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
              sidebarCollapsed
                ? 'justify-center px-0'
                : '',
            ].join(' ')}
            title={
              sidebarCollapsed
                ? 'Assets'
                : undefined
            }
          >
            <FileImage
              size={18}
              className="shrink-0"
            />

            {!sidebarCollapsed && (
              <span>Assets</span>
            )}
          </button>
        </nav>

        {/* Collapse */}
        <div className="hidden border-t border-slate-200 p-3 dark:border-slate-800 lg:block">
          <button
            type="button"
            onClick={() =>
              setSidebarCollapsed(
                (current) =>
                  !current
              )
            }
            className="flex w-full items-center justify-center rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label={
              sidebarCollapsed
                ? 'Expand sidebar'
                : 'Collapse sidebar'
            }
          >
            {sidebarCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>
        </div>

        {/* User */}
        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          <div
            className={[
              'flex items-center gap-3 rounded-xl bg-slate-50 p-2 dark:bg-slate-950',
              sidebarCollapsed
                ? 'justify-center'
                : '',
            ].join(' ')}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {getInitials(
                user?.name ||
                  user?.email ||
                  'User'
              )}
            </div>

            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                  {user?.name ||
                    'User'}
                </p>
                <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                  {user?.email}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div
        className={[
          'min-h-screen transition-[padding] duration-200',
          sidebarCollapsed
            ? 'lg:pl-[76px]'
            : 'lg:pl-[260px]',
        ].join(' ')}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 sm:px-6">
          <button
            type="button"
            onClick={() =>
              setSidebarOpen(true)
            }
            className="mr-3 rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu size={21} />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold tracking-tight text-slate-950 dark:text-white">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label="Toggle theme"
            >
              {resolvedTheme ===
              'dark' ? (
                <Sun size={19} />
              ) : (
                <Moon size={19} />
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                navigate('/settings')
              }
              className="hidden rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white sm:block"
              aria-label="Settings"
            >
              <Settings size={19} />
            </button>

            <button
              type="button"
              onClick={() =>
                navigate('/profile')
              }
              className="hidden rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white sm:block"
              aria-label="Profile"
            >
              <User size={19} />
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-xl p-2.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
              aria-label="Sign out"
            >
              <LogOut size={19} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function getPageTitle(
  pathname: string
) {
  if (
    pathname === '/dashboard' ||
    pathname === '/'
  ) {
    return 'Overview';
  }

  if (pathname.startsWith('/create')) {
    return 'Create QR Code';
  }

  if (
    pathname.startsWith('/qr/')
  ) {
    return 'QR Code';
  }

  if (
    pathname.startsWith(
      '/my-qr-codes'
    )
  ) {
    return 'My QR Codes';
  }

  if (
    pathname.startsWith(
      '/analytics'
    )
  ) {
    return 'Analytics';
  }

  if (
    pathname.startsWith(
      '/templates'
    )
  ) {
    return 'Templates';
  }

  if (
    pathname.startsWith(
      '/settings'
    )
  ) {
    return 'Settings';
  }

  if (
    pathname.startsWith(
      '/profile'
    )
  ) {
    return 'Profile';
  }

  return 'QR Studio';
}

function getInitials(
  value: string
) {
  const parts =
    value
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return value
    .slice(0, 2)
    .toUpperCase();
}