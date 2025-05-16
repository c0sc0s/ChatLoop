import { RouterProvider } from "react-router-dom";
import router from "./routes/router";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "sonner";
import FullScreenLoader from "./pages/LoadingPage";
import useAppStore from "./core/store/app";
import { useAuthInit } from "./core/hooks/init";

function App() {
  useAuthInit();

  const hasInit = useAppStore((state) => state.hasInit);

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
    <main className="h-screen w-screen">
      <Toaster />
      <RouterProvider router={router} />
    </main>
  );
}

export default App;
