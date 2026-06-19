/** Return to an existing account with email + password. */
import React from 'react';
import { AuthForm } from '../../src/ui/AuthForm';

export default function SignIn() {
  return <AuthForm mode="signin" />;
}
