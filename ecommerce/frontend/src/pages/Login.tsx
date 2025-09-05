import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, state, clearError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextUrl = searchParams.get('next');

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, []); // Remove clearError from dependencies

  // Redirect if already authenticated
  useEffect(() => {
    if (state.isAuthenticated) {
      if (nextUrl) {
        // Handle potential open redirect
        window.location.href = nextUrl;
      } else {
        navigate('/');
      }
    }
  }, [state.isAuthenticated, navigate, nextUrl]);

  // Update the handleSubmit function

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const nextUrl = searchParams.get('next');
    
    // Check for Open Redirect vulnerability BEFORE making login request
    if (nextUrl && (nextUrl.startsWith('http://') || nextUrl.startsWith('https://'))) {
      const whitelisted = ['localhost', '127.0.0.1'];
      const isWhitelisted = whitelisted.some(domain => nextUrl.includes(domain));
      
      if (!isWhitelisted && nextUrl.includes('bb_open_redirect=1')) {
        // Open Redirect vulnerability detected!
        const bugData = {
          bug_found: 'OPEN_REDIRECT',
          message: 'Open Redirect detected!',
          description: `Vulnerable redirect to external URL: ${nextUrl.substring(0, 50)}...`,
          points: 90,
          redirect_to: nextUrl,
          vulnerability_type: 'Open Redirect',
          severity: 'Medium'
        };
        
        // Show the bug notification
        if (typeof window !== 'undefined' && (window as any).checkAndShowBugNotification) {
          (window as any).checkAndShowBugNotification(bugData);
        }
        
        // Simulate the redirect after showing notification
        setTimeout(() => {
          console.log(`🔄 Would redirect to: ${nextUrl}`);
          console.log('⚠️ This demonstrates the open redirect vulnerability!');
          // In a real attack, this would redirect: window.location.href = nextUrl;
        }, 2000);
        
        return; // Don't proceed with actual login
      }
    }
    
    // Continue with normal login if no vulnerability detected
    await login(email, password, nextUrl);
    navigate(nextUrl || '/');
  } catch (error) {
    console.error('Login failed:', error);
  }
};

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (state.error) clearError();
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (state.error) clearError();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link to="/register" className="font-medium text-primary hover:text-primary/80">
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={handleEmailChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="mt-1 relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary pr-10"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-primary hover:text-primary/80">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-primary hover:text-primary/80">
                Sign up here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;