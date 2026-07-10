import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Navbar } from "@/components/nav/Navbar";
import { Footer } from "@/components/nav/Footer";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}
