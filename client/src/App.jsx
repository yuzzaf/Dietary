import { BrowserRouter } from 'react-router';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import { store } from './store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AppRoutes from './routes/AppRoutes';
import InteractiveGrid from './components/common/InteractiveGrid';

const queryClient = new QueryClient();

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1038144026602-xxxxxxxx.apps.googleusercontent.com';

  return (
    <Provider store={store}>
      <GoogleOAuthProvider clientId={googleClientId}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <InteractiveGrid />
            <Toaster position="top-center" />
            <AppRoutes />
          </BrowserRouter>
        </QueryClientProvider>
      </GoogleOAuthProvider>
    </Provider>
  );
}

export default App;
