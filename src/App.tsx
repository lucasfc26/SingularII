import { lazy, useCallback, useState } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { PublicLayout } from '@/layouts/PublicLayout';
import { BlackHoleLoader } from '@/components/loaders/BlackHoleLoader';
import Home from '@/pages/Home';

const Explore = lazy(() => import('@/pages/Explore'));
const CategoryPage = lazy(() => import('@/pages/CategoryPage'));
const Articles = lazy(() => import('@/pages/Articles'));
const ArticleDetail = lazy(() => import('@/pages/ArticleDetail'));
const News = lazy(() => import('@/pages/News'));
const NewsDetail = lazy(() => import('@/pages/NewsDetail'));
const Events = lazy(() => import('@/pages/Events'));
const EventDetail = lazy(() => import('@/pages/EventDetail'));
const Downloads = lazy(() => import('@/pages/Multimedia'));
const Profile = lazy(() => import('@/pages/Profile'));
const Login = lazy(() => import('@/pages/Auth').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('@/pages/Auth').then((m) => ({ default: m.Register })));
const StaticPage = lazy(() => import('@/pages/StaticPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const AdminLayout = lazy(() => import('@/layouts/AdminLayout'));
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AdminArticles = lazy(() => import('@/pages/admin/AdminArticles'));
const ArticleEditorPage = lazy(() => import('@/pages/admin/ArticleEditorPage'));
const AdminNews = lazy(() => import('@/pages/admin/AdminNews'));
const AdminEvents = lazy(() => import('@/pages/admin/AdminEvents'));
const AdminMedia = lazy(() => import('@/pages/admin/AdminMedia'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminAdmins = lazy(() => import('@/pages/admin/AdminAdmins'));
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'));
const AdminSupporters = lazy(() => import('@/pages/admin/AdminSupporters'));

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/explorar', element: <Explore /> },
      { path: '/categorias/:slug', element: <CategoryPage /> },
      { path: '/artigos', element: <Articles /> },
      { path: '/artigos/:slug', element: <ArticleDetail /> },
      { path: '/noticias', element: <News /> },
      { path: '/noticias/:slug', element: <NewsDetail /> },
      { path: '/eventos', element: <Events /> },
      { path: '/eventos/:slug', element: <EventDetail /> },
      { path: '/downloads', element: <Downloads /> },
      { path: '/multimidia', element: <Navigate to="/downloads" replace /> },
      { path: '/perfil', element: <Profile /> },
      { path: '/login', element: <Login /> },
      { path: '/cadastro', element: <Register /> },
      { path: '/sobre', element: <StaticPage page="sobre" /> },
      { path: '/contato', element: <StaticPage page="contato" /> },
      { path: '/privacidade', element: <StaticPage page="privacidade" /> },
      { path: '/termos', element: <StaticPage page="termos" /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'artigos', element: <AdminArticles /> },
      { path: 'artigos/novo', element: <ArticleEditorPage /> },
      { path: 'artigos/:id/editar', element: <ArticleEditorPage /> },
      { path: 'noticias', element: <AdminNews /> },
      { path: 'eventos', element: <AdminEvents /> },
      { path: 'downloads', element: <AdminMedia /> },
      { path: 'multimidia', element: <Navigate to="/admin/downloads" replace /> },
      { path: 'apoiadores', element: <AdminSupporters /> },
      { path: 'usuarios', element: <AdminUsers /> },
      { path: 'administradores', element: <AdminAdmins /> },
      { path: 'configuracoes', element: <AdminSettings /> },
    ],
  },
]);

export default function App() {
  const [booting, setBooting] = useState(() => {
    try {
      return !sessionStorage.getItem('horizonte:booted');
    } catch {
      return true;
    }
  });
  const done = useCallback(() => {
    setBooting(false);
    try {
      sessionStorage.setItem('horizonte:booted', '1');
    } catch {
      /* noop */
    }
  }, []);
  return (
    <>
      <RouterProvider router={router} />
      <AnimatePresence>{booting && <BlackHoleLoader key="boot" onDone={done} />}</AnimatePresence>
    </>
  );
}
