import { makeAutoObservable } from "mobx";
import { makePersistable } from "mobx-persist-store";

class state {
    loggedIn = false;
    username = "";
    token = "";
    isAdmin = false;
    isSuperAdmin = false;
    errorTimeout = null
    errorMessage = "";

    constructor() {
        makeAutoObservable(this);
        makePersistable(this, {
            name: "AppState",
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

    onError(message) {
        if (this.errorTimeout) {
            clearTimeout(this.errorTimeout);
        }
        this.errorMessage = message;
        this.errorTimeout = setTimeout(() => {
            this.resetError();
        }, 5000);
    }

    resetError() {
        this.errorMessage = "";
        this.errorTimeout = null;
    }
}

export const AppState = new state();
