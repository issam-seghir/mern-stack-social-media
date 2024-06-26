import { LoginForm } from "@jsx/components/LoginForm";
import { LoginLayout } from "@jsx/components/LoginLayout";

export function Login() {
  return (
		<LoginLayout formType="login">
			<LoginForm />
		</LoginLayout>
  );
}
