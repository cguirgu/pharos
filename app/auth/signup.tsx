/** Create an account with email + password. */
import React from 'react';
import { AuthForm } from '../../src/ui/AuthForm';

export default function SignUp() {
  return <AuthForm mode="signup" />;
}
