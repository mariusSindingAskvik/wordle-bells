import { useState } from "react";
import { useEffect } from "react";
import { useCallback } from "react";
import { AuthModel } from "pocketbase";
import { client } from "../pocketbase";

export function useAuth() {
  const { authStore } = client;
  const [user, setUser] = useState<AuthModel>();
  const [hasVerifiedEmail, setHasVerifiedEmail] = useState<boolean>();
  const [token, setToken] = useState<string>();

  useEffect(() => {
    checkVerifiedEmail();

    return authStore.onChange((token: string, model: AuthModel) => {
      setToken(token);
      setUser(model);
    });
  }, []);

  const checkVerifiedEmail = useCallback(async () => {
    if (isLoggedIn()) {
      const userId = authStore.model?.id;
      const userData = await client.collection("users").getOne(userId);
      setHasVerifiedEmail(userData.verified);
    }
  }, []);

  const loginWithProvider = useCallback(async (provider: string) => {
    const authMethods = await client.collection("users").listAuthMethods();
    const validProvider =
      authMethods.authProviders.filter(({ name }) => name === provider).length >
      0;
    console.log(authMethods, validProvider);
    return await client.collection("users").authWithOAuth2({
      provider: provider ?? "github",
    });
  }, []);

  const loginEmail = useCallback(async (email: string, password: string) => {
    return await client
      .collection("users")
      .authWithPassword(email, password)
      .catch(console.error);
  }, []);

  const registerEmail = useCallback(
    async (email: string, password: string, username?: string) => {
      return await client
        .collection("users")
        .create({
          email,
          password,
          passwordConfirm: password,
          username: username,
        })
        .then(() => loginEmail(email, password))
        .catch(console.error);
    },
    []
  );

  const requestVerification = async () => {
    if (isLoggedIn() && !hasVerifiedEmail) {
      const email = authStore.model?.email;
      return await client
        .collection("users")
        .requestVerification(email)
        .catch(console.error);
    }
  };

  const isLoggedIn = useCallback(() => {
    return authStore.isValid;
  }, []);

  const logout = useCallback(() => {
    client.authStore.clear();
  }, []);

  return {
    isLoggedIn,
    token,
    user,
    registerEmail,
    loginWithProvider,
    loginEmail,
    logout,
    hasVerifiedEmail,
    requestVerification,
  };
}
