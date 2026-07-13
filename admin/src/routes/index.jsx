import { Navigate, useRoutes } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import Dashboard from '@/pages/Dashboard'
import UserManagement from '@/pages/users/Index'
import BookManagement from '@/pages/books/Index'
import CrawlerManagement from '@/pages/crawler/Index'
import Settings from '@/pages/Settings'

const AppRoutes = () => {
  const routes = useRoutes([
    {
      path: '/',
      element: <MainLayout />,
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        { path: 'dashboard', element: <Dashboard /> },
        { path: 'users', element: <UserManagement /> },
        { path: 'books', element: <BookManagement /> },
        { path: 'crawler', element: <CrawlerManagement /> },
        { path: 'settings', element: <Settings /> },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/dashboard" replace />,
    },
  ])

  return routes
}

export default AppRoutes
