import { Route } from "wouter";
import { AuthRouter } from "./AuthRouter";
import { HomeRouter } from "./HomeRouter";
import { AuthState } from "../state/AuthState";
import { observer } from "mobx-react-lite";

export const BaseRouter = observer(() => {
  const isLoggedIn = AuthState.loggedIn;

  return (
    <>
      {isLoggedIn ? <HomeRouter /> : <AuthRouter />}
    </>
  );
});
