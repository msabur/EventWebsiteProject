import { makeAutoObservable } from "mobx";
import { makePersistable } from "mobx-persist-store";

class state {
    loggedIn = false;
    username = "";
    token = "";
    isAdmin = false;
    isSuperAdmin = false;

    constructor() {
        makeAutoObservable(this);
        makePersistable(this, {
            name: "AuthState",
            properties: ["loggedIn", "username", "token", "isAdmin", "isSuperAdmin"],
            storage: window.localStorage
        })
    }

    onLogin(username, data) {
        const { token, isAdmin, isSuperAdmin } = data;
        this.loggedIn = true;
        this.username = username;
        this.token = token;
        this.isAdmin = isAdmin;
        this.isSuperAdmin = isSuperAdmin;
    }

    onLogout() {
        this.loggedIn = false;
        this.username = "";
        this.token = "";
        return true;
    }
}

export const AuthState = new state();
