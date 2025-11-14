import { Routes, Route, Navigate } from "react-router-dom";
import { pferoutes } from "./allroutes";
interface RouteConfig {
  path: string;
  element: React.ReactNode;
  children?: RouteConfig[];
}
const Routing = () => {
  return (
    <Routes>
      {pferoutes.map(({ path, element, children }: RouteConfig, index) => (
        <Route key={index} path={path} element={element}>
          {children &&
            children.map((child, childIndex) => (
              <Route
                key={childIndex}
                path={child.path}
                element={child.element}
              />
            ))}
        </Route>
      ))}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default Routing;
