import React from "react";
import { Navigate } from "react-router-dom";

type IProtetedRoutesProps = {
  children: React.ReactChild;
};

function ProtectedRoutes(props: IProtetedRoutesProps) {
  const { children } = props;

  if (!localStorage.getItem("authToken")) {
    return <Navigate to={"/login"} />;
  }

  return <>{children}</>;
}

export default ProtectedRoutes;
