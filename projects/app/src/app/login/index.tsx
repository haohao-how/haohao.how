import { RectButton2 } from "@/components/RectButton2";
import { RootView } from "@/components/RootView";
import { SignInWithAppleButton } from "@/components/SignInWithAppleButton";
import {
  useClientStorageMutation,
  useClientStorageQuery,
} from "@/util/clientStorage";
import { trpc } from "@/util/trpc";
import { invariant } from "@haohaohow/lib/invariant";
import { SizableText } from "@tamagui/text";
import * as AppleAuthentication from "expo-apple-authentication";
import { useCallback } from "react";
import { Platform, StyleSheet } from "react-native";
import z from "zod";

const SESSION_ID_KEY = `sessionId`;

export default function LoginPage() {
  const sessionIdQuery = useClientStorageQuery(SESSION_ID_KEY);
  const sessionIdMutation = useClientStorageMutation(SESSION_ID_KEY);
  const signInWithAppleMutate = trpc.auth.signInWithApple.useMutation();

  const createSession = useCallback(
    async (identityToken: string) => {
      const { session } = await signInWithAppleMutate.mutateAsync({
        identityToken,
      });
      sessionIdMutation.mutate(session.id);
    },
    [sessionIdMutation, signInWithAppleMutate],
  );

  return (
    <RootView style={styles.container}>
      <SizableText>Login</SizableText>
      <SizableText>Session ID: {sessionIdQuery.data}</SizableText>

      <RectButton2
        onPressIn={() => {
          sessionIdMutation.mutate(null);
        }}
        style={{ height: 50 }}
      >
        Logout
      </RectButton2>

      {Platform.OS === `web` ? (
        <SignInWithAppleButton
          clientId="how.haohao.app"
          onSuccess={(data) => {
            void createSession(data.authorization.id_token);
          }}
          redirectUri={`https://${location.hostname}/api/auth/login/apple/callback`}
        />
      ) : null}

      {Platform.OS === `ios` ? (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={5}
          style={styles.button}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onPress={async () => {
            let credential;
            try {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                  AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                  AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
              });
            } catch (e) {
              const err = z.object({ code: z.string() }).safeParse(e);
              if (err.success) {
                switch (err.data.code) {
                  case `ERR_REQUEST_CANCELED`:
                    // handle that the user canceled the sign-in flow
                    // eslint-disable-next-line no-console
                    console.log(`request canceled`);
                    break;
                  default:
                    // eslint-disable-next-line no-console
                    console.log(
                      `unknown error code=${err.data.code}, error=`,
                      err.data,
                    );
                }
              } else {
                // eslint-disable-next-line no-console
                console.log(
                  `unknown error (no code), error=`,
                  JSON.stringify(e),
                );
              }

              return;
            }

            invariant(credential.identityToken != null);

            void createSession(credential.identityToken);
          }}
        />
      ) : null}
    </RootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: `center`,
    justifyContent: `center`,
    gap: 10,
  },
  button: {
    width: 200,
    height: 44,
  },
});
