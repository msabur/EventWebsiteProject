import { observer } from "mobx-react-lite";
import { Route, Switch } from "wouter";
import { FruitsPage } from '../pages/FruitsPage';
import { EventsListPage } from "../pages/EventsListPage";
import { EventPage } from "../pages/EventPage";
import { ControlPanelPage } from "../pages/ControlPanelPage";
import { LogoutPage } from "../pages/LogoutPage";

export const HomeRouter = observer(() => (
    <Switch>
        <Route path="/" component={EventsListPage}/>
        <Route path="/events/:id" component={EventPage}/>
        <Route path="/controlPanel" component={ControlPanelPage}/>
        <Route path="/fruits" component={FruitsPage} />
        <Route path="/logout" component={LogoutPage}/>
        <Route>404 - Not Found</Route>
    </Switch>
));
