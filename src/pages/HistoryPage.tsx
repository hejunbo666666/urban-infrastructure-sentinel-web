import { ReportList } from '../components/ReportList'
import { useReportsContext } from '../store/reports-context'

export function HistoryPage() {
  const { reports, changeStatus } = useReportsContext()
  return <ReportList reports={reports} onChangeStatus={changeStatus} />
}
