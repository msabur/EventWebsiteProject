import { observer } from 'mobx-react-lite';
import React from 'react';
import { AuthState } from '../state/AuthState'

export const HomePage = observer(() => (
  <>
    <p>Welcome to the homepage, {AuthState.username}!</p>
    {AuthState.isAdmin && <p>You are an admin</p>}
    {AuthState.isSuperAdmin && <p>You are a super admin</p>}
  </>
));
