import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { CartProvider } from './context/CartContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { WishlistProvider } from './context/WishlistContext.jsx'
import './index.css'
import App from './App.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (count, err) => (err?.status >= 400 && err?.status < 500 ? false : count < 2),
      refetchOnWindowFocus: false,
    },
  },
})

function Root() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <App />
          <Toaster
            position="bottom-center"
            toastOptions={{
              classNames: {
                toast: '!rounded-2xl !border-line !shadow-pop !font-sans',
                description: '!text-muted',
              },
            }}
          />
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  )
}

// Data router (enables navigation blocking for unsaved admin forms); <App> declares the nested <Routes>.
const router = createBrowserRouter([{ path: '*', element: <Root /> }])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
