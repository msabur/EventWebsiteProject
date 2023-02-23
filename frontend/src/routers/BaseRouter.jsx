import { Route } from "wouter";
import { AuthRouter } from "./AuthRouter";
import { HomeRouter } from "./HomeRouter";
import { AppState } from "../state/AppState";
import { observer } from "mobx-react-lite";

export const BaseRouter = observer(() => {
  const isLoggedIn = AppState.loggedIn;

  return (
    <>
      {isLoggedIn ? <HomeRouter /> : <AuthRouter />}
    </>
  );
});
