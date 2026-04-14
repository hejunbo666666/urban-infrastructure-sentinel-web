# Urban Infrastructure Sentinel (Frontend)

A mobile-oriented **urban infrastructure inspection** web application: login, report issues, map viewing, my records, and PWA offline capabilities.

# Backend Repository Address
https://github.com/hejunbo666666/urban_infrastructure_sentinelApi.git

## User Usage Steps

1. **Open the Application**  
   Access the deployment address in the browser. If not logged in, you will enter the **Sign in** page.

2. **Login**  
   Enter your account and password, then click **Sign in**. After successful login, you will default to the **Report** page.

3. **Submit a Report**  
   - Fill in **Title**, select **Category**, and fill in **Description**.  
   - Click **Use GPS location** to get the current location (latitude, longitude, and address will be displayed below).  
   - Optional: **Take photo** or **Choose from gallery** to add images (uploaded only when online).  
   - Click **Submit report** to submit.  
   - Offline: Reports without images can be queued for saving; reports with images require network connection or remove images before submitting; automatic sync will be attempted when network is restored.

4. **View on Map**  
   Tap **Map** at the bottom, filter by **Status** / **Category**, view statistics and points; click on markers on the map, and the **Selected marker** below will show a summary.

5. **My**  
   Tap **My** at the bottom to see the current account and **My reports** count; **Sign out** to log out.

6. **View and Manage Records**  
   - In **My**, enter **My reports** to browse the list.  
   - **View details** to enter single item details: view description, location, photos, modify **Status** (Pending / Processing / Resolved), or **Delete**.  
   - In the list, you can also quickly change status with **Pending / Processing / Resolved**.

7. **Install to Home Screen (Optional)**  
   At the bottom of the **Report** page, tap **Install to home screen** (requires HTTPS or `localhost`; for development environment, test under `build` + `preview`; for iOS, use Safari: **Share → Add to Home Screen**).

8. **Notifications (Optional)**  
   On the **Report** page, tap **Enable notifications**, follow browser prompts to authorize (will prompt if not supported).

---

```bash
npm install
npm run dev
```

By default, requests the backend via `API_BASE_URL` in `src/services/api.ts`; to change the API address, modify that constant and rebuild.

```bash
npm run build    # Production build
npm run preview  # Local preview of build results (suitable for testing PWA installation)
```

Generate PWA required icons (depends on `public/logo.png`):

```bash
npm run pwa:icons
```
