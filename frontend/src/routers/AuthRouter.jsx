// routes for non-logged in users

import { Route, Switch } from "wouter";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";

export const AuthRouter = () => (
    <Switch>
        <Route path="/" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route>404 - Not Found</Route>
    </Switch>
)
