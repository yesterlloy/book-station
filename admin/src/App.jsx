import { useEffect, useState } from 'react'
import { Spin } from 'antd'
import { useAuthStore } from '@/store/auth'
import AppRoutes from '@/routes'
import Login from '@/pages/Login'

function App() {
  const { token, checkAuth } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      if (token) {
        await checkAuth()
      }
      setLoading(false)
    }
    init()
  }, [token, checkAuth])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  if (!token) {
    return <Login />
  }

  return <AppRoutes />
}

export default App
