import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";
import Index from "./pages/Index.tsx";

// Lazy-loaded routes (code-split to keep the homepage bundle small & fast)
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminSetup = lazy(() => import("./pages/admin/AdminSetup"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminChangePassword = lazy(() => import("./pages/admin/AdminChangePassword"));
const AdminForgotPassword = lazy(() => import("./pages/admin/AdminForgotPassword"));
const AdminResetPassword = lazy(() => import("./pages/admin/AdminResetPassword"));
const AdminProjects = lazy(() => import("./pages/admin/AdminProjects"));
const ProjectEditor = lazy(() => import("./pages/admin/ProjectEditor"));
const AdminServices = lazy(() => import("./pages/admin/AdminServices"));
const ServiceEditor = lazy(() => import("./pages/admin/ServiceEditor"));
const AdminBlogs = lazy(() => import("./pages/admin/AdminBlogs"));
const BlogEditor = lazy(() => import("./pages/admin/BlogEditor"));
const AdminLeads = lazy(() => import("./pages/admin/AdminLeads"));
const AdminMedia = lazy(() => import("./pages/admin/AdminMedia"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminActivity = lazy(() => import("./pages/admin/AdminActivity"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminSEO = lazy(() => import("./pages/admin/AdminSEO"));
const AdminAITools = lazy(() => import("./pages/admin/AdminAITools"));
const AdminProposals = lazy(() => import("./pages/admin/AdminProposals"));
const AdminHomepage = lazy(() => import("./pages/admin/AdminHomepage"));
const AdminClients = lazy(() => import("./pages/admin/AdminClients"));
const AdminTeam = lazy(() => import("./pages/admin/AdminTeam"));
const AdminInvoices = lazy(() => import("./pages/admin/AdminInvoices"));
const AdminTasks = lazy(() => import("./pages/admin/AdminTasks"));
const AdminAnnouncements = lazy(() => import("./pages/admin/AdminAnnouncements"));
const AdminExports = lazy(() => import("./pages/admin/AdminExports"));
const AdminPerformance = lazy(() => import("./pages/admin/AdminPerformance"));
const AdminFinance = lazy(() => import("./pages/admin/AdminFinance"));
const AdminCalendar = lazy(() => import("./pages/admin/AdminCalendar"));
const AdminChat = lazy(() => import("./pages/admin/AdminChat"));
const AdminClientUsers = lazy(() => import("./pages/admin/AdminClientUsers"));
const AdminInsights = lazy(() => import("./pages/admin/AdminInsights"));
const AdminAutomation = lazy(() => import("./pages/admin/AdminAutomation"));
const AdminBrands = lazy(() => import("./pages/admin/AdminBrands"));
const PayInvoice = lazy(() => import("./pages/PayInvoice"));
const PayResult = lazy(() => import("./pages/PayResult"));
const ClientLogin = lazy(() => import("./pages/portal/ClientLogin"));
const ClientHome = lazy(() => import("./pages/portal/ClientHome"));
const ClientProjects = lazy(() => import("./pages/portal/ClientProjects"));
const ClientInvoices = lazy(() => import("./pages/portal/ClientInvoices"));
const ClientMeetings = lazy(() => import("./pages/portal/ClientMeetings"));
const ClientMessages = lazy(() => import("./pages/portal/ClientMessages"));
const ClientProposals = lazy(() => import("./pages/portal/ClientProposals"));
const AuthBoundary = lazy(() => import("@/components/AuthBoundary").then((module) => ({ default: module.AuthBoundary })));
const ProtectedAuthBoundary = lazy(() =>
  import("@/components/AuthBoundary").then((module) => ({ default: module.ProtectedAuthBoundary })),
);
const ToastHosts = lazy(() => import("@/components/ToastHosts").then((module) => ({ default: module.ToastHosts })));

const WithAuth = ({ el }: { el: JSX.Element }) => <AuthBoundary>{el}</AuthBoundary>;
const Protected = ({ el }: { el: JSX.Element }) => <ProtectedAuthBoundary>{el}</ProtectedAuthBoundary>;

const RouteFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-10 h-10 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
  </div>
);

const DeferredToastHosts = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const scheduleIdle = window.requestIdleCallback ?? ((callback: IdleRequestCallback) => window.setTimeout(callback, 1200));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    const id = scheduleIdle(() => setReady(true));
    return () => cancelIdle(id as never);
  }, []);

  return ready ? (
    <Suspense fallback={null}>
      <ToastHosts />
    </Suspense>
  ) : null;
};

const App = () => (
  <>
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Index />} />

              {/* Public payment */}
              <Route path="/pay/:token" element={<PayInvoice />} />
              <Route path="/pay/:token/success" element={<PayResult outcome="success" />} />
              <Route path="/pay/:token/failed" element={<PayResult outcome="failed" />} />

              {/* Client portal */}
          <Route path="/portal/login" element={<WithAuth el={<ClientLogin />} />} />
          <Route path="/portal" element={<WithAuth el={<ClientHome />} />} />
          <Route path="/portal/projects" element={<WithAuth el={<ClientProjects />} />} />
          <Route path="/portal/invoices" element={<WithAuth el={<ClientInvoices />} />} />
          <Route path="/portal/meetings" element={<WithAuth el={<ClientMeetings />} />} />
          <Route path="/portal/messages" element={<WithAuth el={<ClientMessages />} />} />
          <Route path="/portal/proposals" element={<WithAuth el={<ClientProposals />} />} />

              {/* Admin */}
          <Route path="/admin/setup" element={<WithAuth el={<AdminSetup />} />} />
          <Route path="/admin/login" element={<WithAuth el={<AdminLogin />} />} />
          <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
          <Route path="/admin/reset-password" element={<AdminResetPassword />} />

              <Route path="/admin" element={<Protected el={<AdminDashboard />} />} />
              <Route path="/admin/dashboard" element={<Protected el={<AdminDashboard />} />} />
              <Route path="/admin/change-password" element={<Protected el={<AdminChangePassword />} />} />

              <Route path="/admin/projects" element={<Protected el={<AdminProjects />} />} />
              <Route path="/admin/projects/:id" element={<Protected el={<ProjectEditor />} />} />
              <Route path="/admin/services" element={<Protected el={<AdminServices />} />} />
              <Route path="/admin/services/:id" element={<Protected el={<ServiceEditor />} />} />
              <Route path="/admin/blogs" element={<Protected el={<AdminBlogs />} />} />
              <Route path="/admin/blogs/:id" element={<Protected el={<BlogEditor />} />} />
              <Route path="/admin/leads" element={<Protected el={<AdminLeads />} />} />
              <Route path="/admin/media" element={<Protected el={<AdminMedia />} />} />
              <Route path="/admin/settings" element={<Protected el={<AdminSettings />} />} />
              <Route path="/admin/activity" element={<Protected el={<AdminActivity />} />} />
              <Route path="/admin/analytics" element={<Protected el={<AdminAnalytics />} />} />
              <Route path="/admin/seo" element={<Protected el={<AdminSEO />} />} />
              <Route path="/admin/ai-tools" element={<Protected el={<AdminAITools />} />} />
              <Route path="/admin/proposals" element={<Protected el={<AdminProposals />} />} />
              <Route path="/admin/homepage" element={<Protected el={<AdminHomepage />} />} />
              <Route path="/admin/clients" element={<Protected el={<AdminClients />} />} />
              <Route path="/admin/client-users" element={<Protected el={<AdminClientUsers />} />} />
              <Route path="/admin/invoices" element={<Protected el={<AdminInvoices />} />} />
              <Route path="/admin/tasks" element={<Protected el={<AdminTasks />} />} />
              <Route path="/admin/announcements" element={<Protected el={<AdminAnnouncements />} />} />
              <Route path="/admin/exports" element={<Protected el={<AdminExports />} />} />
              <Route path="/admin/performance" element={<Protected el={<AdminPerformance />} />} />
              <Route path="/admin/finance" element={<Protected el={<AdminFinance />} />} />
              <Route path="/admin/calendar" element={<Protected el={<AdminCalendar />} />} />
              <Route path="/admin/chat" element={<Protected el={<AdminChat />} />} />
              <Route path="/admin/insights" element={<Protected el={<AdminInsights />} />} />
              <Route path="/admin/automation" element={<Protected el={<AdminAutomation />} />} />
              <Route path="/admin/team" element={<Protected el={<AdminTeam />} />} />
              <Route path="/admin/brands" element={<Protected el={<AdminBrands />} />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
    <DeferredToastHosts />
  </>
);
export default App;
