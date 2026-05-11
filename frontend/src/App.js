import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import AdminDashboard from './components/workflow/AdminDashboard';
import StudentDashboard from './components/workflow/StudentDashboard';
import NgoDashboard from './components/workflow/NgoDashboard';
import {
  getApplications,
  getConventions,
  submitApplication,
  validateApplication,
  rejectApplication
} from './api/workflowService';
import {
  USER_ROLES,
  createDemoProfile,
  getCurrentSession,
  getUserProfile,
  isDemoBuild,
  isSupabaseConfigured,
  normalizeRole,
  onAuthStateChange,
  signInWithPassword,
  signOut,
  signUpWithPassword
} from './lib/supabase';
import { I18nProvider } from './i18n/I18nContext';
import './App.css';

function LoginView({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('student');
  const [organizationName, setOrganizationName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const isSignUp = mode === 'signup';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const { user, session } = await signUpWithPassword({
          email,
          password,
          fullName,
          role,
          organizationName
        });

        if (!session && user) {
          setMessage('Check your email to confirm your account, then sign in.');
        }
      } else {
        await signInWithPassword({ email, password });
      }

      await onAuthenticated();
    } catch (error) {
      setMessage(error.message || 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page" data-testid="login-view">
      <section className="auth-card">
        <div>
          <p className="auth-eyebrow">Secure access</p>
          <h1>{isSignUp ? 'Create your ImpactBeta account' : 'Sign in to ImpactBeta'}</h1>
          <p className="auth-subtitle">
            Use your real account to load your profile, permissions, and protected dashboard.
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div className="workflow-alert" role="alert">
            Supabase login is not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY,
            or build with REACT_APP_DEMO_MODE=true for demos.
          </div>
        )}

        {message && <div className="auth-message" role="status">{message}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {isSignUp && (
            <>
              <label>
                Full name
                <input required value={fullName} onChange={(event) => setFullName(event.target.value)} />
              </label>
              <label>
                Role assignment
                <select value={role} onChange={(event) => setRole(event.target.value)}>
                  {USER_ROLES.map((item) => (
                    <option key={item} value={item}>{item.replace('_', ' ')}</option>
                  ))}
                </select>
              </label>
              <label>
                School / NGO organization
                <input
                  value={organizationName}
                  onChange={(event) => setOrganizationName(event.target.value)}
                  placeholder={role === 'ngo_admin' ? 'La Croix-Rouge française' : 'Sciences Po'}
                />
              </label>
            </>
          )}

          <label>
            Email
            <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            Password
            <input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <button type="submit" className="auth-primary" disabled={!isSupabaseConfigured || isSubmitting}>
            {isSubmitting ? 'Please wait…' : isSignUp ? 'Create account' : 'Log in'}
          </button>
        </form>

        <button type="button" className="auth-link" onClick={() => setMode(isSignUp ? 'login' : 'signup')}>
          {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Create one'}
        </button>
      </section>
    </div>
  );
}

function AppContent() {
  const [profile, setProfile] = useState(() => (isDemoBuild ? createDemoProfile('school_admin') : null));
  const [applications, setApplications] = useState([]);
  const [conventions, setConventions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(!isDemoBuild);
  const [errorMessage, setErrorMessage] = useState('');

  const currentRole = normalizeRole(profile?.role);

  const loadAuthenticatedProfile = useCallback(async () => {
    if (isDemoBuild) {
      setAuthLoading(false);
      return;
    }

    setAuthLoading(true);
    setErrorMessage('');

    try {
      const { user } = await getCurrentSession();
      setProfile(user ? await getUserProfile(user) : null);
    } catch (error) {
      setErrorMessage(error.message || 'The current user profile could not be loaded.');
      setProfile(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const reloadData = useCallback(async () => {
    if (!profile) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      const [apps, convs] = await Promise.all([
        getApplications(profile),
        getConventions(profile)
      ]);
      setApplications(apps);
      setConventions(convs);
    } catch (error) {
      setErrorMessage(error.message || 'The workflow data could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    loadAuthenticatedProfile();
  }, [loadAuthenticatedProfile]);

  useEffect(() => {
    if (isDemoBuild) return undefined;
    const subscription = onAuthStateChange(async (user) => {
      try {
        setProfile(user ? await getUserProfile(user) : null);
      } catch (error) {
        setErrorMessage(error.message || 'The current user profile could not be loaded.');
        setProfile(null);
      } finally {
        setAuthLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  const handleDemoRoleChange = (role) => {
    if (!isDemoBuild) return;
    setProfile(createDemoProfile(role));
  };

  const handleLogout = async () => {
    setErrorMessage('');
    try {
      if (isDemoBuild) {
        setProfile(createDemoProfile('school_admin'));
        return;
      }

      await signOut();
      setProfile(null);
    } catch (error) {
      setErrorMessage(error.message || 'Logout failed.');
    }
  };

  const handleSubmitApplication = async (payload) => {
    const securedPayload = currentRole === 'student'
      ? {
          ...payload,
          studentName: profile.fullName,
          studentEmail: profile.email
        }
      : payload;

    await submitApplication(securedPayload, profile);
    await reloadData();
  };

  const handleValidate = async (id) => {
    if (currentRole !== 'school_admin') throw new Error('Only school administrators can validate requests.');
    await validateApplication(id, profile);
    await reloadData();
  };

  const handleReject = async (id) => {
    if (currentRole !== 'school_admin') throw new Error('Only school administrators can reject requests.');
    await rejectApplication(id, profile);
    await reloadData();
  };

  const roleApplications = useMemo(() => applications, [applications]);
  const roleConventions = useMemo(() => conventions, [conventions]);

  const renderDashboard = () => {
    if (!USER_ROLES.includes(currentRole)) {
      return <div className="workflow-card">Your account does not have an assigned application role.</div>;
    }

    if (currentRole === 'school_admin') {
      return (
        <AdminDashboard
          applications={roleApplications}
          conventions={roleConventions}
          onValidate={handleValidate}
          onReject={handleReject}
        />
      );
    }

    if (currentRole === 'student') {
      return (
        <StudentDashboard
          applications={roleApplications}
          conventions={roleConventions}
          profile={profile}
          onSubmitApplication={handleSubmitApplication}
        />
      );
    }

    return <NgoDashboard conventions={roleConventions} />;
  };

  if (authLoading) {
    return <div className="auth-page"><div className="auth-card">Loading secure session…</div></div>;
  }

  if (!profile) {
    return <LoginView onAuthenticated={loadAuthenticatedProfile} />;
  }

  return (
    <div className="app-container" data-testid="app-container">
      <Sidebar currentRole={currentRole} />
      <div className="main-content">
        <Topbar
          currentRole={currentRole}
          roles={USER_ROLES}
          profile={profile}
          isDemoBuild={isDemoBuild}
          onRoleChange={handleDemoRoleChange}
          onLogout={handleLogout}
        />
        <div className="page-content">
          {errorMessage && (
            <div className="workflow-alert" role="alert">
              {errorMessage}
            </div>
          )}
          {isLoading ? (
            <div className="workflow-card">Loading protected workflow…</div>
          ) : renderDashboard()}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}

export default App;
