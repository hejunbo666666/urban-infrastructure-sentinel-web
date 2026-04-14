import { ReportForm } from '../components/ReportForm'
import { useReportsContext } from '../store/reports-context'

export function ReportPage() {
  const {
    categories,
    title,
    description,
    categoryId,
    latitude,
    longitude,
    address,
    photoFile,
    setTitle,
    setDescription,
    setCategoryId,
    setPhotoFile,
    locate,
    submitReport,
    installApp,
    askNotificationPermission,
  } = useReportsContext()

  return (
    <ReportForm
      categories={categories}
      title={title}
      description={description}
      categoryId={categoryId}
      latitude={latitude}
      longitude={longitude}
      address={address}
      photoFile={photoFile}
      onTitleChange={setTitle}
      onDescriptionChange={setDescription}
      onCategoryChange={setCategoryId}
      onLocate={locate}
      onFileChange={setPhotoFile}
      onSubmit={submitReport}
      onInstall={installApp}
      onNotificationPermission={askNotificationPermission}
    />
  )
}
