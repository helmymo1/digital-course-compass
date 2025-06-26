
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import MobileNotificationBell from './MobileNotificationBell'; // Import NotificationBell

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { name: t('courses'), href: '/courses' },
    { name: t('about'), href: '/about' },
    { name: t('contact'), href: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">L</span>
            </div>
            <span className="font-bold text-xl">{t('learnhub')}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.href) ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Link
              to="/dashboard"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {t('dashboard')}
            </Link>
          </div>

          {/* Desktop Auth Buttons & Notifications */}
          <div className="hidden md:flex items-center space-x-2"> {/* Reduced space-x-4 to space-x-2 */}
            <MobileNotificationBell />
            <LanguageSwitcher />
            <Link to="/login">
              <Button variant="ghost">{t('login')}</Button>
            </Link>
            <Link to="/signup">
              <Button>{t('signup')}</Button>
            </Link>
          </div>

          {/* Mobile Menu Trigger & Notifications */}
          <div className="flex items-center md:hidden">
            <MobileNotificationBell />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  {/* Language switcher could also be here if not next to bell icon globally */}
                  <div className="mb-4 px-6"> {/* Added px-6 for consistency with other items if needed */}
                    <LanguageSwitcher />
                  </div>
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`px-6 py-2 text-lg font-medium transition-colors hover:text-primary ${
                        isActive(item.href) ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className={`px-6 py-2 text-lg font-medium transition-colors hover:text-primary ${
                      isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {t('dashboard')}
                  </Link>
                  <div className="flex flex-col space-y-2 pt-4 px-6">
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full">{t('login')}</Button>
                    </Link>
                    <Link to="/signup" onClick={() => setIsOpen(false)}>
                      <Button className="w-full">{t('signup')}</Button>
                    </Link>
                  </div>
                </div>
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`text-lg font-medium transition-colors hover:text-primary ${
                      isActive(item.href) ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className={`text-lg font-medium transition-colors hover:text-primary ${
                    isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {t('dashboard')}
                </Link>
                <div className="flex flex-col space-y-2 pt-4">
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full">{t('login')}</Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)}>
                    <Button className="w-full">{t('signup')}</Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
