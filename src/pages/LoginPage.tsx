import { useState } from 'react'
import { Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useReportsContext } from '../store/reports-context'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, login } = useReportsContext()
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')

  if (currentUser) {
    return <Navigate to="/report" replace />
  }

  const onSubmit = async () => {
    const ok = await login(account, password)
    if (!ok) return
    const redirectPath = (location.state as { from?: string } | null)?.from ?? '/report'
    navigate(redirectPath, { replace: true })
  }

  return (
    <Stack spacing={2} sx={{ px: 2, pt: 2 }}>
      <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box
          component="img"
          src="/logo.png"
          alt="Urban Infrastructure Sentinel"
          sx={{ width: '100%', height: 120, objectFit: 'contain', bgcolor: '#fff', display: 'block' }}
        />
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={1.5}>
            <Typography variant="h6" fontWeight={700}>
              Sign in to continue
            </Typography>
            <TextField
              label="Account"
              value={account}
              onChange={(event) => setAccount(event.target.value)}
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              fullWidth
            />
            <Button variant="contained" onClick={onSubmit}>
              Sign in
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
