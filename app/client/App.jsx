import { AppProvider as PolarisProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import translations from "@shopify/polaris/locales/en.json";
import { useRoutes, Link } from "raviger";
import routes from "./Routes";
import AppBridgeProvider from "./providers/AppBridgeProvider";

export default function App() {
  const RouteComponents = useRoutes(routes);

  return (
    <PolarisProvider i18n={translations}>
      <AppBridgeProvider>
        <ui-nav-menu>
          <Link href="/discounts">Manage Discounts</Link>
          <Link href="/distribution">Manage Distribution</Link>
          <Link href="/settings">Settings</Link>
        </ui-nav-menu>
        {RouteComponents}
      </AppBridgeProvider>
    </PolarisProvider>
  );
}
