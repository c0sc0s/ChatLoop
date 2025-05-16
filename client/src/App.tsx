import { RouterProvider } from "react-router-dom";
import router from "./routes/router";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "sonner";
import FullScreenLoader from "./pages/LoadingPage";
import useAppStore from "./core/store/app";
import { useAuthInit } from "./core/hooks/app/init";
import { useEffect } from "react";
import WsClient from "./core/ws/client";

function App() {
  useAuthInit();

  const hasInit = useAppStore((state) => state.hasInit);
  const hasLogin = useAppStore((state) => state.hasLogin);

  useEffect(() => {
    if (hasLogin) {
      WsClient.init();
    }
  }, [hasLogin]);

  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        {hasInit ? <AppContent /> : <FullScreenLoader />}
      </ThemeProvider>
    </>
  );
}

function AppContent() {
  return (
    <main className="h-screen w-screen flex">
      <Toaster />
      <RouterProvider router={router} />
    </main>
  );
}

export default App;
