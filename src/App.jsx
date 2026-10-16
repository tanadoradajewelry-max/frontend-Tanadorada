import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollTopButton from "./components/ScrollTopButton";
import AdminGuard from "./components/admin/AdminGuard";

import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage";
import CollectionPage from "./pages/CollectionPage";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import AccountComingSoon from "./pages/account/AccountComingSoon";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminCollections from "./pages/admin/AdminCollections";
import AdminContent from "./pages/admin/AdminContent";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminMenu from "./pages/admin/AdminMenu";
import AboutPage from "./pages/AboutPage";
import CharmBarPage from "./pages/CharmBarPage";
import AdminCharmBar from "./pages/admin/AdminCharmBar";

export default function App() {
  return (
    <BrowserRouter>
      <div className="tanadorada-body template-index">
        <Header />

        <main id="MainContent" className="main-content" role="main">
          <Routes>
            {/* --- Tienda pública --- */}
            <Route path="/" element={<Home />} />
            <Route path="/producto/:productId" element={<ProductPage />} />
            <Route path="/coleccion/:categorySlug" element={<CollectionPage />} />
            <Route path="/carrito" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/gracias" element={<OrderConfirmation />} />
             <Route path="/sobre-nosotros" element={<AboutPage />} />
            <Route path="/charm-bar" element={<CharmBarPage />} />
            <Route
              path="/cuenta/iniciar-sesion"
              element={<AccountComingSoon title="Iniciar Sesión" />}
            />
            <Route
              path="/cuenta/registro"
              element={<AccountComingSoon title="Crear Cuenta" />}
            />

            {/* --- Login del admin (el único del admin que es público) --- */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* --- TODO lo que esté dentro de este bloque pasa por
                 AdminGuard. Para agregar otra página de admin, ponla aquí. --- */}
            <Route element={<AdminGuard />}>
              <Route path="/admin" element={<AdminProducts />} />
              <Route path="/admin/nuevo" element={<AdminProductForm />} />
              <Route path="/admin/menu" element={<AdminMenu />} />
              <Route path="/admin/editar/:productId" element={<AdminProductForm />} />
              <Route path="/admin/colecciones" element={<AdminCollections />} />
             <Route path="/admin/charm-bar" element={<AdminCharmBar />} />
              <Route path="/admin/contenido" element={<AdminContent />} />
              <Route path="/admin/pedidos" element={<AdminOrders />} />
            </Route> 
          </Routes>
        </main>

        <Footer />
        <ScrollTopButton />
      </div>
    </BrowserRouter>
  );
}
