import { useCheckEmailExistsQuery, useRegisterMutation } from "@jsx/store/api/authApi";
import { useDebounce, useMediaQuery } from "@uidotdev/usehooks";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import useFormPersist from "react-hook-form-persist";
import { useNavigate } from "react-router-dom";

import { isDev } from "@data/constants";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import { logFormData } from "@jsx/utils/logFormData";
// import { useFormHandleErrors } from "@utils/hooks/useFormHandleErrors";
import { PFormTextField } from "@components/Form/PFormTextField";
import { PFormAutoCompleteContries } from "@jsx/components/Form/PFormAutoCompleteContries";
import { useIsAppleDevice } from "@jsx/utils/hooks/useIsAppleDevice";
import { registerSchema } from "@validations/authSchema";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Toast } from "primereact/toast";
import { useDispatch } from "react-redux";

import { SocialAuth } from "./SocialAuth";

export function RegisterForm() {
	const navigate = useNavigate();

	const isAppleDevice = useIsAppleDevice();
	const isNonMobile = useMediaQuery("(min-width:600px)");

	const dispatch = useDispatch();
	const toast = useRef(null);

	const [register, { error: registerError, isLoading: isRegisterLoading, isError: isRegisterError }] =
		useRegisterMutation();
	const {
		handleSubmit,
		reset,
		setValue,
		setError,
		clearErrors,
		watch,
		control,
		getValues,
		register: formRegister,
		trigger,
		formState: { errors: errorsForm, isSubmitting },
	} = useForm({
		mode: "onChange",
		resolver: zodResolver(registerSchema),
	});

	useFormPersist("registerForm", {
		watch,
		setValue,
		storage: window.sessionStorage, // default window.sessionStorage
		exclude: ["picture", "password", "confirmPassword"],
	});

	const picture = watch("picture");
	console.log(picture);
	const errorMessage = isRegisterError ? registerError : errorsForm;

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
		if (chekcEmailExistance && !chekcEmailExistance.invalid && !isEmailCheckError) {
			setError("email", {
				type: "manual",
				message: "Email Already Exist",
			});
		} else {
			clearErrors("email");
		}
	}, [chekcEmailExistance, setError, clearErrors]);

	async function handleRegister(data) {
		try {
			console.log(data);
			const res = await register(data).unwrap();

			if (res) {
				console.log(res);
				toast.current.show({
					severity: "success",
					summary: "Successful Sign up 🚀",
					detail: `Welcome ${res?.user?.name || "Unknown"} 👋`,
				});
				reset();
				navigate("/home");
			}
		} catch (error) {
			console.error(error);
			toast.current.show({
				severity: "error",
				summary: "Something Wrong 💢",
				detail: JSON.stringify(error),
			});
		}
	}

	const onSubmit = (data) => {
		handleRegister(data);
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
						defaultValue={""}
						name={"firstName"}
						label="First Name"
						size={"lg"}
						iconStart={"pi-user"}
						errorMessage={errorMessage}
					/>
					<PFormTextField
						control={control}
						defaultValue={""}
						name={"lastName"}
						label="Last Name"
						size={"lg"}
						iconStart={"pi-user"}
						errorMessage={errorMessage}
					/>
					<PFormTextField
						control={control}
						defaultValue={""}
						name={"email"}
						label="Email"
						type="email"
						size={"lg"}
						iconStart={"pi-envelope"}
						iconEnd={showSpinner ? "pi-spin pi-spinner" : "pi-time"}
						clearIconSpace={true}
						errorMessage={errorMessage}
					/>
					<PFormTextField
						control={control}
						defaultValue={""}
						name={"password"}
						label="password"
						type="password"
						size={"lg"}
						iconStart={"pi-lock"}
						toogleMask={true}
						clearIconSpace={true}
						errorMessage={errorMessage}
					/>
					<PFormTextField
						control={control}
						defaultValue={""}
						name={"confirmPassword"}
						label="Confirm Password"
						type="password"
						size={"lg"}
						iconStart={"pi-lock"}
						clearIconSpace={true}
						errorMessage={errorMessage}
					/>
					<PFormTextField
						control={control}
						defaultValue={""}
						name={"job"}
						label="Job"
						size={"lg"}
						iconStart={"pi-briefcase"}
						errorMessage={errorMessage}
					/>
					<PFormAutoCompleteContries
						control={control}
						getValues={getValues}
						defaultValue={""}
						name={"location"}
						iconStart={"pi-map-marker"}
						label="Location"
						size={"lg"}
						errorMessage={errorMessage}
					/>
					<div className="mb-2 mx-3 text-center" style={{ textWrap: "balance" }}>
						By signing up, you agree to our Terms , Privacy Policy .
					</div>

					<Button
						label={isRegisterLoading ? "Loading..." : "Sign Up"}
						className="btn-sign-in w-17rem lg:w-7"
						iconPos="right"
						size={isNonMobile ? "large" : "small"}
						loading={isSubmitting || isRegisterLoading}
					>
						<svg viewBox="0 0 180 60" className="sign-in border">
							<polyline points="179,1 179,59 1,59 1,1 179,1" className="bg-line" />
							<polyline points="179,1 179,59 1,59 1,1 179,1" className="hl-line" />
						</svg>
					</Button>
					<Divider align="center">
						<span>or you can sign up with </span>
					</Divider>
					<SocialAuth />
					<Button
						link
						className="text-xs sm:text-base font-small px-0 md:px-2 underline ml-2  text-left cursor-pointer"
						onClick={() => navigate("/")}
					>
						{"Already have an account? Login here."}
					</Button>
				</div>
			</form>
		</>
	);
}
