export const reverseGeocode = async (lat: number, lng: number) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
    )
    if (!response.ok) return `${lat}, ${lng}`
    const data: { display_name?: string } = await response.json()
    return data.display_name ?? `${lat}, ${lng}`
  } catch {
    return `${lat}, ${lng}`
  }
}
