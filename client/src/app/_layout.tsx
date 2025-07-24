import SystemProvider from "powersync/SystemProvider";
import "../global.css";
import { Slot } from "expo-router";

export default function Layout() {
  return (
    <SystemProvider>
      <Slot />
    </SystemProvider>
  );
}
