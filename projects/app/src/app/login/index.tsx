import { RectButton } from "@/components/RectButton";
import { SignInWithAppleButton } from "@/components/SignInWithAppleButton";
import {
  useClientStorageMutation,
  useClientStorageQuery,
} from "@/util/clientStorage";
import { trpc } from "@/util/trpc";
import { invariant } from "@haohaohow/lib/invariant";
import * as AppleAuthentication from "expo-apple-authentication";
import { useCallback } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
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
    <View style={styles.container}>
      <Text>Login</Text>
      <Text>Session ID: {sessionIdQuery.data}</Text>

      <RectButton
        onPressIn={() => {
          sessionIdMutation.mutate(null);
        }}
        color={`#333`}
        style={{ height: 50 }}
      >
        <Text style={{ fontWeight: `bold`, color: `white`, fontSize: 10 }}>
          Logout
        </Text>
      </RectButton>

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
    </View>
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
