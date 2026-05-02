import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function Layout() {
  return (
    <div className="min-h-screen bg-[#FDF8F3] dark:bg-[#0F1419] transition-colors duration-300">
      <Navbar />
      <main className="min-h-[calc(100vh-64px-200px)]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
