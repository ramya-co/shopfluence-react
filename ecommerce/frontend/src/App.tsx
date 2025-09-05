import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { CouponProvider } from "@/context/CouponContext";
import Header from "@/components/common/Header";
import Home from "@/pages/Home";
import ProductListing from "@/pages/ProductListing";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "./pages/NotFound";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import Debug from "./pages/Debug";
import LeaderboardPage from "./pages/LeaderboardPage";
import ScrollToTop from '@/components/ScrollToTop';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <CouponProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen bg-background">
                <Header />
                <ScrollToTop />
                <main>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<ProductListing />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/category/:category" element={<ProductListing />} />
                    <Route path="/search" element={<ProductListing />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/account/profile" element={<Profile />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/leaderboard" element={<LeaderboardPage />} />
                    <Route path="/debug" element={<Debug />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </CouponProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
