import { RouterProvider } from "react-router-dom";
import router from "./routes/router";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "sonner";
import FullScreenLoader from "./pages/LoadingPage";
import useAppStore from "./core/store/app";
import { useAuthInit } from "./core/hooks/app/init";
import { useEffect } from "react";
import WsClient from "./core/ws/client";
import useInitData from "./core/hooks/data/useInit";

function App() {
  useAuthInit();

  const hasInit = useAppStore((state) => state.hasInit);
  const hasLogin = useAppStore((state) => state.hasLogin);

  useEffect(() => {
    if (hasLogin) {
      WsClient.init();
    }
  }, [hasLogin]);

  useInitData();

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
      <Toaster
        theme="dark"
        richColors
        toastOptions={{
          duration: 2000,
          className: "text-sm",
          style: {
            borderRadius: "6px",
            overflow: "hidden",
          },
        }}
      />
      <RouterProvider router={router} />
    </main>
  );
}

export default App;
