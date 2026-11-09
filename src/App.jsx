import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Bundles from './pages/Bundles';
import Luxe from './pages/Luxe';
import ReviewsPage from './pages/ReviewsPage';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Account from './pages/Account';
import Track from './pages/Track';
import OrderPlaced from './pages/OrderPlaced';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="bundles" element={<Bundles />} />
        <Route path="luxe" element={<Luxe />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="login" element={<Login />} />
        <Route path="account" element={<Account />} />
        <Route path="track" element={<Track />} />
        <Route path="order-placed/:id" element={<OrderPlaced />} />
        <Route path="admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
