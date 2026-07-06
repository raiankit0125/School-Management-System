import { Link } from "react-router-dom";

export default function SiteFooter({ compact = false }) {
  return (
    <footer className={`${compact ? "mt-8" : "mt-10"} site-footer rounded-[26px] px-5 py-5 text-sm shadow-[0_22px_52px_-36px_rgba(15,23,42,0.55)] sm:px-6`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link to="/about" className="text-lg font-semibold">Smart Management</Link>
          <p className="mt-1 text-sm">A simple portal for daily management workflows.</p>
        </div>

        <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:gap-4">
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/privacy">Privacy Policy</Link>
        </div>
      </div>

      <div className="site-footer-bottom mt-4 flex flex-col gap-1 border-t pt-3 text-xs sm:flex-row sm:items-center sm:justify-between">
        <Link to="/contact">Support Team</Link>
        <span>(c) 2026 Smart Management. All rights reserved.</span>
      </div>
    </footer>
  );
}
