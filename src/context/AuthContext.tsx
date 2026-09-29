import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export interface LocalUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface StoredAccount {
  user: LocalUser;
  password: string;
}

interface AuthContextValue {
  user: LocalUser | null;
  session: null;
  loading: boolean;

  signIn: (
    email: string,
    password: string
  ) => Promise<{
    error: Error | null;
  }>;

  signUp: (
    email: string,
    password: string
  ) => Promise<{
    error: Error | null;
  }>;

  signOut: () => Promise<{
    error: Error | null;
  }>;

  updateProfile: (
    updates: Partial<Pick<LocalUser, 'name' | 'email'>>
  ) => Promise<{
    error: Error | null;
  }>;
}

const AuthContext = createContext<
  AuthContextValue | undefined
>(undefined);

const USERS_KEY = 'qr-studio-local-users';
const SESSION_KEY = 'qr-studio-local-user';

function readAccounts(): Record<
  string,
  StoredAccount
> {
  try {
    const stored = localStorage.getItem(USERS_KEY);

    if (!stored) {
      return {};
    }

    return JSON.parse(stored) as Record<
      string,
      StoredAccount
    >;
  } catch {
    return {};
  }
}

function writeAccounts(
  accounts: Record<string, StoredAccount>
) {
  localStorage.setItem(
    USERS_KEY,
    JSON.stringify(accounts)
  );
}

function readCurrentUser(): LocalUser | null {
  try {
    const stored =
      localStorage.getItem(SESSION_KEY);

    if (!stored) {
      return null;
    }

    return JSON.parse(stored) as LocalUser;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function createUser(
  email: string
): LocalUser {
  const now = new Date().toISOString();

  return {
    id: `local-${crypto.randomUUID()}`,
    email,
    name: email.split('@')[0],
    createdAt: now,
  };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<LocalUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const currentUser =
      readCurrentUser();

    setUser(currentUser);
    setLoading(false);
  }, []);

  async function signUp(
    email: string,
    password: string
  ) {
    const normalizedEmail =
      normalizeEmail(email);

    if (
      !normalizedEmail ||
      !normalizedEmail.includes('@')
    ) {
      return {
        error: new Error(
          'Please enter a valid email address.'
        ),
      };
    }

    if (password.length < 6) {
      return {
        error: new Error(
          'Password must contain at least 6 characters.'
        ),
      };
    }

    const accounts = readAccounts();

    if (accounts[normalizedEmail]) {
      return {
        error: new Error(
          'An account with this email already exists.'
        ),
      };
    }

    const newUser =
      createUser(normalizedEmail);

    accounts[normalizedEmail] = {
      user: newUser,
      password,
    };

    writeAccounts(accounts);

    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify(newUser)
    );

    setUser(newUser);

    return {
      error: null,
    };
  }

  async function signIn(
    email: string,
    password: string
  ) {
    const normalizedEmail =
      normalizeEmail(email);

    if (!normalizedEmail) {
      return {
        error: new Error(
          'Please enter your email address.'
        ),
      };
    }

    if (!password) {
      return {
        error: new Error(
          'Please enter your password.'
        ),
      };
    }

    const accounts = readAccounts();

    const account =
      accounts[normalizedEmail];

    if (
      !account ||
      account.password !== password
    ) {
      return {
        error: new Error(
          'Invalid email or password.'
        ),
      };
    }

    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify(account.user)
    );

    setUser(account.user);

    return {
      error: null,
    };
  }

  async function signOut() {
    localStorage.removeItem(
      SESSION_KEY
    );

    setUser(null);

    return {
      error: null,
    };
  }

  async function updateProfile(
    updates: Partial<
      Pick<LocalUser, 'name' | 'email'>
    >
  ) {
    if (!user) {
      return {
        error: new Error(
          'You must be signed in.'
        ),
      };
    }

    const accounts = readAccounts();

    const oldEmail = user.email;
    const newEmail =
      updates.email !== undefined
        ? normalizeEmail(updates.email)
        : oldEmail;

    if (
      !newEmail ||
      !newEmail.includes('@')
    ) {
      return {
        error: new Error(
          'Please enter a valid email address.'
        ),
      };
    }

    if (
      newEmail !== oldEmail &&
      accounts[newEmail]
    ) {
      return {
        error: new Error(
          'That email address is already in use.'
        ),
      };
    }

    const updatedUser: LocalUser = {
      ...user,
      name:
        updates.name !== undefined
          ? updates.name.trim() ||
            user.name
          : user.name,
      email: newEmail,
    };

    const existingAccount =
      accounts[oldEmail];

    if (existingAccount) {
      delete accounts[oldEmail];

      accounts[newEmail] = {
        ...existingAccount,
        user: updatedUser,
      };
    }

    writeAccounts(accounts);

    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify(updatedUser)
    );

    setUser(updatedUser);

    return {
      error: null,
    };
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session: null,
      loading,
      signIn,
      signUp,
      signOut,
      updateProfile,
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    );
  }

  return context;
}