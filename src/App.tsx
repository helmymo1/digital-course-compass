
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Signup from "./pages/Signup";
import TeacherDashboard from "./pages/TeacherDashboard";
import Profile from "./pages/Profile";
import Account from "./pages/Account";
import CourseManagement from "./pages/CourseManagement";
import QuizManagement from "./pages/QuizManagement";
import PaymentAnalytics from "./pages/PaymentAnalytics";
import PromoCodeManagement from "./pages/PromoCodeManagement";
import AdminDashboard from "./pages/AdminDashboard";
import PasswordReset from "./pages/PasswordReset";
import EmailVerification from "./pages/EmailVerification";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/course/:id" element={<CourseDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/password-reset" element={<PasswordReset />} />
            <Route path="/verify-email/:token" element={<EmailVerification />} />
            <Route path="/payment/:courseId" element={<Payment />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/course-management" element={<CourseManagement />} />
            <Route path="/quiz-management" element={<QuizManagement />} />
            <Route path="/payment-analytics" element={<PaymentAnalytics />} />
            <Route path="/promo-codes" element={<PromoCodeManagement />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/account" element={<Account />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
