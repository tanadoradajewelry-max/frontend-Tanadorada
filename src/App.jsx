import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollTopButton from "./components/ScrollTopButton";
import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminGuard from "./components/admin/AdminGuard";
import AccountComingSoon from "./pages/account/AccountComingSoon";
import RingsCategoryPage from "./pages/RingsCategoryPage";
import NecklacesCategoryPage from "./pages/NecklacesCategoryPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="tanadorada-body template-index">
        <Header />

        <main id="MainContent" className="main-content" role="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/producto/:productId" element={<ProductPage />} />
            <Route path="/carrito" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/gracias" element={<OrderConfirmation />} />
                        <Route path="/coleccion/anillos" element={<RingsCategoryPage />} />
                                    <Route
              path="/cuenta/iniciar-sesion"
              element={<AccountComingSoon title="Iniciar Sesión" />}
            />
            <Route
              path="/cuenta/registro"
              element={<AccountComingSoon title="Crear Cuenta" />}
            />
                        <Route path="/coleccion/collares" element={<NecklacesCategoryPage />} />

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminProducts />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/nuevo"
              element={
                <AdminGuard>
                  <AdminProductForm />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/editar/:productId"
              element={
                <AdminGuard>
                  <AdminProductForm />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/pedidos"
              element={
                <AdminGuard>
                  <AdminOrders />
                </AdminGuard>
              }
            />
          </Routes>
        </main>

        <Footer />
        <ScrollTopButton />
      </div>
    </BrowserRouter>
  );
}
