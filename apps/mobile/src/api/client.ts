/**
 * Centralized API base URL configuration.
 *
 * Set `EXPO_PUBLIC_API_URL` to your backend URL (see `apps/mobile/.env.example`).
 * The `localhost` default works for the iOS simulator, web, and Android via
 * `adb reverse tcp:8080 tcp:8080`. For a physical Android device, point
 * `EXPO_PUBLIC_API_URL` at your dev machine's LAN IP instead.
 */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080";
