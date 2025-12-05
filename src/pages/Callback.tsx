import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, isAuthenticated } from '@/lib/auth0';
import { userService } from '@/services/userService';
import { Loader2 } from 'lucide-react';

/**
 * Callback page to handle Auth0 redirect after login
 * Creates user document in MongoDB if it doesn't exist
 * Note: The actual callback handling is done in auth0.ts initAuth0()
 */
const Callback = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Wait a bit for Auth0 to finish processing the callback
        await new Promise(resolve => setTimeout(resolve, 500));

        const authenticated = await isAuthenticated();
        
        if (authenticated) {
          const user = await getUser();
          
          if (user?.sub) {
            try {
              // Create or update user document in MongoDB
              await userService.createOrUpdate({
                uid: user.sub,
                name: user.name || user.email || undefined,
                email: user.email || undefined,
                picture: user.picture || undefined,
              });

              // Redirect to home
              navigate('/');
            } catch (error) {
              console.error('Error handling callback:', error);
              // Still redirect even if document creation fails
              navigate('/');
            }
          } else {
            navigate('/login');
          }
        } else {
          // Not authenticated, redirect to login
          navigate('/login');
        }
      } catch (error) {
        console.error('Callback error:', error);
        navigate('/login');
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default Callback;

