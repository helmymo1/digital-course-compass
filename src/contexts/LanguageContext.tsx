
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  const isRTL = language === 'ar';

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  const translations = {
    en: {
      // Navigation & Header
      'learnhub': 'LearnHub',
      'courses': 'Courses',
      'about': 'About Us',
      'contact': 'Contact Us',
      'dashboard': 'Dashboard',
      'login': 'Login',
      'signup': 'Sign Up',
      'logout': 'Log out',
      'profile': 'Profile',
      'account': 'Account Settings',
      
      // User Roles
      'student': 'Student',
      'teacher': 'Instructor',
      'admin': 'Administrator',
      'switch_to_student': 'Switch to Student',
      'switch_to_teacher': 'Switch to Instructor',
      'switch_to_admin': 'Switch to Admin',
      
      // Admin Dashboard
      'admin_dashboard': 'Admin Dashboard',
      'manage_platform': 'Manage your platform and monitor performance',
      'overview': 'Overview',
      'user_management': 'User Management',
      'analytics': 'Analytics',
      'revenue_control': 'Revenue Control',
      'total_students': 'Total Students',
      'total_teachers': 'Total Teachers',
      'total_revenue': 'Total Revenue',
      'active_courses': 'Active Courses',
      'from_last_month': 'from last month',
      
      // Quick Actions
      'quick_actions': 'Quick Actions',
      'manage_users': 'Manage Users',
      'manage_users_desc': 'Add, edit, or remove students and teachers',
      'view_analytics': 'View Analytics',
      'view_analytics_desc': 'Monitor platform performance and engagement',
      'revenue_settings': 'Revenue Settings',
      'revenue_settings_desc': 'Control course pricing and revenue distribution',
      
      // Recent Activity
      'recent_activity': 'Recent Activity',
      'new_teacher_registered': 'New teacher registered',
      'sarah_johnson_joined': 'Sarah Johnson joined',
      'course_published': 'Course published',
      'advanced_react_dev': 'Advanced React Development',
      'payment_processed': 'Payment processed',
      'course_enrollment': '$299 course enrollment',
      
      // User Management
      'students': 'Students',
      'teachers': 'Teachers',
      'admins': 'Admins',
      'add_user': 'Add User',
      'add_new_user': 'Add New User',
      'name': 'Name',
      'email': 'Email',
      'role': 'Role',
      'status': 'Status',
      'stats': 'Stats',
      'actions': 'Actions',
      'search_users': 'Search users...',
      'all_roles': 'All Roles',
      'active': 'active',
      'inactive': 'inactive',
      'courses_enrolled': 'courses enrolled',
      'courses_taught': 'courses',
      'students_count': 'students',
      'cancel': 'Cancel',
      'enter_user_name': 'Enter user name',
      'enter_email': 'Enter email address',
      'select_role': 'Select role',
      
      // Time stamps
      'hours_ago': 'h ago',
      'ago': 'ago',
    },
    ar: {
      // Navigation & Header
      'learnhub': 'منصة التعلم',
      'courses': 'الدورات',
      'about': 'من نحن',
      'contact': 'اتصل بنا',
      'dashboard': 'لوحة التحكم',
      'login': 'تسجيل الدخول',
      'signup': 'إنشاء حساب',
      'logout': 'تسجيل الخروج',
      'profile': 'الملف الشخصي',
      'account': 'إعدادات الحساب',
      
      // User Roles
      'student': 'طالب',
      'teacher': 'مدرس',
      'admin': 'مدير',
      'switch_to_student': 'التبديل إلى طالب',
      'switch_to_teacher': 'التبديل إلى مدرس',
      'switch_to_admin': 'التبديل إلى مدير',
      
      // Admin Dashboard
      'admin_dashboard': 'لوحة تحكم المدير',
      'manage_platform': 'إدارة منصتك ومراقبة الأداء',
      'overview': 'نظرة عامة',
      'user_management': 'إدارة المستخدمين',
      'analytics': 'التحليلات',
      'revenue_control': 'إدارة الإيرادات',
      'total_students': 'إجمالي الطلاب',
      'total_teachers': 'إجمالي المدرسين',
      'total_revenue': 'إجمالي الإيرادات',
      'active_courses': 'الدورات النشطة',
      'from_last_month': 'من الشهر الماضي',
      
      // Quick Actions
      'quick_actions': 'إجراءات سريعة',
      'manage_users': 'إدارة المستخدمين',
      'manage_users_desc': 'إضافة أو تعديل أو حذف الطلاب والمدرسين',
      'view_analytics': 'عرض التحليلات',
      'view_analytics_desc': 'مراقبة أداء المنصة والمشاركة',
      'revenue_settings': 'إعدادات الإيرادات',
      'revenue_settings_desc': 'التحكم في أسعار الدورات وتوزيع الإيرادات',
      
      // Recent Activity
      'recent_activity': 'النشاط الأخير',
      'new_teacher_registered': 'مدرس جديد مسجل',
      'sarah_johnson_joined': 'سارة جونسون انضمت',
      'course_published': 'دورة منشورة',
      'advanced_react_dev': 'تطوير React المتقدم',
      'payment_processed': 'تم معالجة الدفع',
      'course_enrollment': 'تسجيل دورة بـ 299 دولار',
      
      // User Management
      'students': 'الطلاب',
      'teachers': 'المدرسين',
      'admins': 'المديرين',
      'add_user': 'إضافة مستخدم',
      'add_new_user': 'إضافة مستخدم جديد',
      'name': 'الاسم',
      'email': 'البريد الإلكتروني',
      'role': 'الدور',
      'status': 'الحالة',
      'stats': 'الإحصائيات',
      'actions': 'الإجراءات',
      'search_users': 'البحث عن المستخدمين...',
      'all_roles': 'جميع الأدوار',
      'active': 'نشط',
      'inactive': 'غير نشط',
      'courses_enrolled': 'دورات مسجلة',
      'courses_taught': 'دورات',
      'students_count': 'طلاب',
      'cancel': 'إلغاء',
      'enter_user_name': 'أدخل اسم المستخدم',
      'enter_email': 'أدخل عنوان البريد الإلكتروني',
      'select_role': 'اختر الدور',
      
      // Time stamps
      'hours_ago': 'س مضت',
      'ago': 'مضت',
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};
