import { Button, Html } from "@react-email/components";
import * as React from "react";

export const MyEmail = () => (
  <Html>
    <Button
      href="https://haohao.how"
      style={{ background: "#000", color: "#fff", padding: "12px 20px" }}
    >
      Goto haohao.how
    </Button>
  </Html>
);

export default MyEmail;
