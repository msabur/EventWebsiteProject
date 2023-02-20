import { makeAutoObservable } from "mobx";
import { makePersistable } from "mobx-persist-store";

class state {
    loggedIn = false;
    username = "";
    token = "";

    constructor() {
        makeAutoObservable(this);
        makePersistable(this, {
            name: "AuthState",
            properties: ["loggedIn", "username", "token"],
            storage: window.localStorage
        })
    }

    onLogin(username, token) {
        this.loggedIn = true;
        this.username = username;
        this.token = token;
    }

    onLogout() {
        this.loggedIn = false;
        this.username = "";
        this.token = "";
        return true;
    }
}

export const AuthState = new state();
