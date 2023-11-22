import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useCallback } from "react";
import { Dispatch } from "react";
import { SetStateAction } from "react";

export const LoginForm = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, loginGithub, loginGitlab, loginEmail } = useAuth();

  const bindInput = (
    callback: Dispatch<SetStateAction<string | undefined>>,
    { target: { value } }: React.ChangeEvent<HTMLInputElement>
  ) => callback(value);
  if (!isLoggedIn) {
    return (
      <>
        <p>You need to be logged in so santa can keep an eye on you</p>
        <button onClick={loginGithub}>Login with GitHub 🐙</button>
      </>
    );
  } else {
    return <>{children}</>;
  }
};
