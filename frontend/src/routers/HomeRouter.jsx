import { Route, Switch } from "wouter";
import { FruitsPage } from '../pages/FruitsPage';
import { HomePage } from "../pages/HomePage";
import { LogoutPage } from "../pages/LogoutPage";

export const HomeRouter = () => (
    <Switch>
        <Route path="/" component={HomePage}/>
        <Route path="/fruits" component={FruitsPage} />
        <Route path="/logout" component={LogoutPage}/>
        <Route>404 - Not Found</Route>
    </Switch>
)
