import { Navigate, Outlet, createBrowserRouter, useLocation } from 'react-router-dom'
import { MobileLayout } from './layouts/MobileLayout'
import { LoginPage } from './pages/LoginPage'
import { MapPage } from './pages/MapPage'
import { MyPage } from './pages/MyPage'
import { MyReportsPage } from './pages/MyReportsPage'
import { ReportDetailPage } from './pages/ReportDetailPage'
import { ReportPage } from './pages/ReportPage'
import { useReportsContext } from './store/reports-context'

function RootRedirect() {
  const { currentUser } = useReportsContext()
  return <Navigate to={currentUser ? '/report' : '/login'} replace />
}

function RequireAuth() {
  const { currentUser } = useReportsContext()
  const location = useLocation()
  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <MobileLayout />,
        children: [
          { path: '/report', element: <ReportPage /> },
          { path: '/map', element: <MapPage /> },
          { path: '/my', element: <MyPage /> },
          { path: '/my/reports', element: <MyReportsPage /> },
          { path: '/my/reports/:reportId', element: <ReportDetailPage /> },
          { path: '/history', element: <Navigate to="/my/reports" replace /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <RootRedirect />,
  },
])
