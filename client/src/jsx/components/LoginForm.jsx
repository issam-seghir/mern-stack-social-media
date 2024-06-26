import { isDev } from "@data/constants";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCheckEmailExistsQuery, useLoginMutation } from "@jsx/store/api/authApi";
import { setCredentials } from "@jsx/store/slices/authSlice";
import { useDebounce, useMediaQuery } from "@uidotdev/usehooks";
import { loginSchema } from "@validations/authSchema";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PFormCheckBox } from "./Form/PFormCheckBox";
import { PFormTextField } from "./Form/PFormTextField";
import { SocialAuth } from "./SocialAuth";
import { LoadingSpinner } from "./LoadingSpinner";

export function LoginForm() {
	const navigate = useNavigate();
	const location = useLocation();
	let from = location.state?.from?.pathname || "/home";

	const isNonMobile = useMediaQuery("(min-width:600px)");

	const dispatch = useDispatch();
	const toast = useRef(null);

	const [login, { error: errorLogin, isLoading: isLoginLoading, isError: isLoginError }] = useLoginMutation();
	const {
		handleSubmit,
		watch,
		reset,
		setError,
		clearErrors,
		control,
		formState: { errors: errorsForm, isSubmitting },
	} = useForm({
		mode: "onChange",
		resolver: zodResolver(loginSchema),
	});

	const errorMessage = isLoginError ? errorLogin : errorsForm;
	// check if use email exist when typing ...
	const email = watch("email");
	const debouncedEmail = useDebounce(errorsForm?.email ? null : email?.trim().toLowerCase(), 500); // Debounce the email input by 500ms
	const {
		data: chekcEmailExistance,
		isLoading: isChekcEmailLoading,
		isFetching: isChekcEmailFetching,
		isError: isEmailCheckError,
	} = useCheckEmailExistsQuery(debouncedEmail, {
		skip: !debouncedEmail, // Skip the query if the email is empty
	});
	const [showSpinner, setShowSpinner] = useState(false);
	useEffect(() => {
		if (isChekcEmailLoading || isChekcEmailFetching) {
			setShowSpinner(true);
			setTimeout(() => {
				setShowSpinner(false);
			}, 700);
		}
	}, [isChekcEmailLoading, isChekcEmailFetching]);

	useEffect(() => {
		if (chekcEmailExistance && chekcEmailExistance.invalid && !isEmailCheckError) {
			setError("email", {
				type: "manual",
				message: "User Not found",
			});
		} else {
			clearErrors("email");
		}
	}, [chekcEmailExistance, setError, clearErrors]);

	async function handleLogin(data) {
		try {
			const res = await login(data).unwrap();
			if (res) {
				dispatch(setCredentials({ user: res?.user, token: res?.token }));
				reset();
				navigate(from, { replace: true });
			}
		} catch (error) {
			console.error(error);
			toast.current.show({
				severity: "error",
				summary: "Login Failed 💢",
				detail: error?.data?.message || "email or password not correct",
			});
		}
	}

	const onSubmit = (data) => {
		handleLogin(data);
	};

	return (
		<>
			{/* react hook form dev tool  */}
			{isDev && <DevTool control={control} placement="top-left" />}
			<Toast ref={toast} />

			<form onSubmit={handleSubmit(onSubmit)}>
				<div className="flex flex-column gap-2 align-items-center">
					<PFormTextField
						control={control}
						defaultValue={"lorando@gmail.com"}
						name={"email"}
						label="Email"
						type="email"
						size={"lg"}
						iconStart={"pi-user"}
						iconEnd={showSpinner ? "pi-spin pi-spinner" : "pi-time"}
						errorMessage={errorMessage}
					/>
					<PFormTextField
						control={control}
						defaultValue={"LoranDo@99"}
						name={"password"}
						label="Password"
						type="password"
						size={"lg"}
						iconStart={"pi-lock"}
						toogleMask={true}
						errorMessage={errorMessage}
					/>
					<div className="flex gap-2 align-items-center justify-content-between mb-4">
						<PFormCheckBox
							control={control}
							defaultValue={true}
							name={"rememberMe"}
							label="Remember me"
							errorMessage={errorsForm}
						/>
						<Link
							to="/forgot-password"
							className="no-underline ml-2 text-xs md:text-base text-blue-500 text-right cursor-pointer"
						>
							Forgot your password?
						</Link>
					</div>

					<Button
						label={isLoginLoading ? "Loading..." : "Sign in"}
						className="btn-sign-in w-17rem lg:w-7"
						iconPos="right"
						size={isNonMobile ? "large" : "small"}
						loading={isSubmitting || isLoginLoading}
						onClick={handleSubmit}
					>
						<svg viewBox="0 0 180 60" className="sign-in border">
							<polyline points="179,1 179,59 1,59 1,1 179,1" className="bg-line" />
							<polyline points="179,1 179,59 1,59 1,1 179,1" className="hl-line" />
						</svg>
						{/* {!isLoginLoading ? <LoadingSpinner /> : ""} */}
					</Button>
					<Divider align="center">
						<span>or you can sign in with </span>
					</Divider>
					<SocialAuth />
					<p>
						<Button
							link
							className="text-xs sm:text-base font-small px-0 md:px-2 underline ml-2  text-left cursor-pointer"
							onClick={() => navigate("/register")}
						>
							{"Don't have an account? Sign Up here."}
						</Button>
					</p>
				</div>
			</form>
		</>
	);
}
