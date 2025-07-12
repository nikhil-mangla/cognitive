import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "./button";
import { Brain, Menu, X } from "lucide-react";
import { isAuthenticated, logout } from "@/lib/auth";

interface NavbarProps {
  onLoginClick?: () => void;
  onSignupClick?: () => void;
}

export function Navbar({ onLoginClick, onSignupClick }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const authenticated = isAuthenticated();

  const handleLogout = () => {
    logout();
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <Brain className="h-8 w-8 text-primary mr-3" />
            <span className="text-xl font-bold text-gray-900">Cognitive Copilot</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {location === "/" && (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Pricing
                </button>
                <a
                  href="#"
                  className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Docs
                </a>
              </div>
            )}
            
            {authenticated ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">Dashboard</Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={onLoginClick}>
                  Sign In
                </Button>
                <Button size="sm" onClick={onSignupClick}>
                  Start Free Trial
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            {location === "/" && (
              <>
                <button
                  onClick={() => scrollToSection("features")}
                  className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary"
                >
                  Pricing
                </button>
                <a
                  href="#"
                  className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary"
                >
                  Docs
                </a>
              </>
            )}
            
            {authenticated ? (
              <>
                <Link href="/dashboard" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onLoginClick}
                  className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary"
                >
                  Sign In
                </button>
                <button
                  onClick={onSignupClick}
                  className="block px-3 py-2 text-base font-medium text-primary hover:text-primary/80"
                >
                  Start Free Trial
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
