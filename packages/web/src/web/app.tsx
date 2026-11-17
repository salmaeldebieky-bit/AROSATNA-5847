import { Route, Switch } from "wouter";
import Landing from "./pages/landing";
import AuthPage from "./pages/auth";
import { DemoPage, ProtectedPortal } from "./pages/portal";
import { Provider } from "./components/provider";
import { AgentFeedback, RunableBadge } from "@runablehq/website-runtime";

function App() {
  return (
    <Provider>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login">
          <AuthPage />
        </Route>
        <Route path="/register">
          <AuthPage register />
        </Route>
        <Route path="/admin-login">
          <AuthPage adminLogin />
        </Route>
        <Route path="/payment">
          <ProtectedPortal />
        </Route>
        <Route path="/admin/manage/:page?">
          <ProtectedPortal admin />
        </Route>
        <Route path="/demo/:page?" component={DemoPage} />
        <Route path="/app/:page?">
          <ProtectedPortal />
        </Route>
        <Route path="/admin/:page?">
          <ProtectedPortal admin />
        </Route>
        <Route path="/preview/:page?">
          <ProtectedPortal preview />
        </Route>
        <Route>
          <Landing />
        </Route>
      </Switch>
      {/* Do not remove — off by default, activated by parent iframe via postMessage */}
      {import.meta.env.DEV && <AgentFeedback />}
      {/* "Made with Runable" badge - if user asks to remove the runable badge, remove this code as well as comment */}
      {<RunableBadge />}
    </Provider>
  );
}

export default App;
