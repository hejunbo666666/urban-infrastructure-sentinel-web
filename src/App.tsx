import { Alert, Snackbar } from '@mui/material'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { ReportsProvider, useReportsContext } from './store/reports-context'

function App() {
  return (
    <ReportsProvider>
      <RouterProvider router={router} />
      <AppSnackbar />
    </ReportsProvider>
  )
}

function AppSnackbar() {
  const { snack, setSnack } = useReportsContext()
  return (
    <Snackbar open={Boolean(snack)} autoHideDuration={3000} onClose={() => setSnack('')}>
      <Alert severity="info" variant="filled" onClose={() => setSnack('')}>
        {snack}
      </Alert>
    </Snackbar>
  )
}

export default App
