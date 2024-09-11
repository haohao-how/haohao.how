import { RectButton } from "@/components/RectButton";
import {
  useClientStorageMutation,
  useClientStorageQuery,
} from "@/util/clientStorage";
import * as AppleAuthentication from "expo-apple-authentication";
import { Platform, StyleSheet, Text, View } from "react-native";
import z from "zod";

const SESSION_ID_KEY = `sessionId`;

export default function LoginPage() {
  const sessionIdQuery = useClientStorageQuery(SESSION_ID_KEY);
  const sessionIdMutation = useClientStorageMutation(SESSION_ID_KEY);

  return (
    <View style={styles.container}>
      <Text>Login</Text>
      <Text>Session ID: {sessionIdQuery.data}</Text>

      <RectButton
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onPressIn={async () => {
          // // eslint-disable-next-line no-console
          // console.log(`fetching \`/api/replicache/push\``);
          // {
          //   const res = await fetch(`/api/replicache/push`);
          //   if (res.ok) {
          //     console.log(await res.text());
          //   }
          // }
          // eslint-disable-next-line no-console
          console.log(`fetching \`/api/test\``);
          {
            const res = await fetch(`/api/test`, {
              method: `POST`,
              body: JSON.stringify({ key: `value` }),
              headers: {
                "content-type": `application/json`,
                authorization: `foo`,
              },
              // headers: {
              //   Cookies: `test=foo`,
              // },
              // credentials: `include`,
              // credentials: `omit`,
            });
            if (res.ok) {
              const result = z
                .object({ sessionId: z.string() })
                .safeParse(await res.json());

              if (result.success) {
                sessionIdMutation.mutate(result.data.sessionId);
                // await SecureStore.setItemAsync(
                //   SESSION_ID_KEY,
                //   result.data.sessionId,
                // );
              } else {
                // eslint-disable-next-line no-console
                console.log(`failed to parse response json`);
              }
            }
          }
        }}
        color={`#333`}
        style={{ height: 50 }}
      >
        <Text style={{ fontWeight: `bold`, color: `white`, fontSize: 10 }}>
          Make API request
        </Text>
      </RectButton>

      <RectButton
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
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

      {Platform.OS === `ios` ? (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={5}
          style={styles.button}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onPress={async () => {
            try {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                  AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                  AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
              });
              // signed in
              // eslint-disable-next-line no-console
              console.log(`signed in, credential=`, credential);
              credential.identityToken;

              // eslint-disable-next-line no-console
              console.log(`fetching \`/api/login/apple\``);
              {
                const res = await fetch(`/api/auth/login/apple`, {
                  method: `POST`,
                  body: JSON.stringify({
                    identityToken: credential.identityToken,
                  }),
                  headers: {
                    "content-type": `application/json`,
                  },
                });
                if (res.ok) {
                  const userSchema = z.object({
                    id: z.string(),
                    name: z.string().optional(),
                  });

                  const sessionSchema = z.object({
                    id: z.string(),
                  });

                  const responseBodySchema = z.object({
                    session: sessionSchema,
                    user: userSchema,
                  });

                  const result = responseBodySchema.safeParse(await res.json());

                  if (result.success) {
                    sessionIdMutation.mutate(result.data.session.id);
                  } else {
                    // eslint-disable-next-line no-console
                    console.log(
                      `failed to parse response json ${JSON.stringify(result.error)}`,
                    );
                  }
                }
              }
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
            }
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
