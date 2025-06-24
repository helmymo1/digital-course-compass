
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { User, Settings, LogOut, BookOpen, GraduationCap, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface HeaderProps {
  userRole?: 'student' | 'teacher' | 'admin';
  userName?: string;
  onRoleSwitch?: (role: 'student' | 'teacher' | 'admin') => void;
}

const Header = ({ userRole = 'student', userName = 'User', onRoleSwitch }: HeaderProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/');
  };

  const handleRoleSwitch = (newRole: 'student' | 'teacher' | 'admin') => {
    localStorage.setItem('userRole', newRole);
    if (onRoleSwitch) {
      onRoleSwitch(newRole);
    }
  };

  const getRoleBadgeVariant = () => {
    switch (userRole) {
      case 'admin':
        return 'destructive';
      case 'teacher':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getRoleDisplayName = () => {
    switch (userRole) {
      case 'admin':
        return t('admin');
      case 'teacher':
        return t('teacher');
      default:
        return t('student');
    }
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">L</span>
            </div>
            <span className="font-bold text-xl">{t('learnhub')}</span>
          </Link>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <Badge variant={getRoleBadgeVariant()}>
              {getRoleDisplayName()}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" alt={userName} />
                    <AvatarFallback>
                      {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{userName}</p>
                    <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => handleRoleSwitch('student')}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>{t('switch_to_student')}</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => handleRoleSwitch('teacher')}>
                  <GraduationCap className="mr-2 h-4 w-4" />
                  <span>{t('switch_to_teacher')}</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => handleRoleSwitch('admin')}>
                  <Shield className="mr-2 h-4 w-4" />
                  <span>{t('switch_to_admin')}</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <Link to="/profile">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>{t('profile')}</span>
                  </DropdownMenuItem>
                </Link>
                
                <Link to="/account">
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{t('account')}</span>
                  </DropdownMenuItem>
                </Link>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
