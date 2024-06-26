/* eslint-disable jsx-a11y/label-has-associated-control */
import { useMediaQuery } from "@uidotdev/usehooks";
import { InputText } from "primereact/inputtext";
import { classNames } from "primereact/utils";
import { useState } from "react";
import { Controller } from "react-hook-form";

export function PFormTextField({
	control,
	defaultValue = "",
	name,
	label,
	type = "text",
	size,
	iconStart,
	iconEnd,
	toogleMask = false,
	errorMessage,
	disabled = false,
	clearIconSpace = false,
}) {
	const sizeClass = `p-inputtext-${size}`;
	const [showPassword, setShowPassword] = useState(false);
	const isMobile = useMediaQuery("only screen and (max-width : 460px)");
	const isSmallDevice = useMediaQuery("only screen and (max-width : 768px)");
	const isMediumDevice = useMediaQuery("only screen and (min-width : 769px) and (max-width : 992px)");
	const getFormErrorMessage = (name) => {
		if (errorMessage[name]) {
			// react-hook-form error
			return <small className="p-error">{errorMessage[name].message}</small>;
		} else if (errorMessage?.data?.field === name) {
			// server error
			return <small className="p-error">{errorMessage?.data?.message}</small>;
		} else {
			return <small className="p-error">&nbsp;</small>;
		}
	};
	const togglePassword = () => {
		setShowPassword(!showPassword);
	};

	return (
		<Controller
			defaultValue={defaultValue}
			name={name}
			control={control}
			render={({ field, fieldState }) => (
				<div className="flex flex-column align-items-center ">
					<span
						className={classNames(
							{ "p-float-label": label },
							{ "p-input-icon-left": iconStart },
							{ "p-input-icon-right": iconEnd || toogleMask }
						)}
					>
						{iconStart && <i className={classNames("pi", iconStart)} />}
						<InputText
							id={field.name}
							value={field.value}
							type={showPassword ? "text" : type}
							className={classNames(
								{ "p-invalid": fieldState.error },
								{ "p-inputtext-sm": isMobile },
								{ "p-inputtext-md": isSmallDevice },
								{ [sizeClass]: !isSmallDevice && size },
							)}
							disabled={disabled}
							onChange={(e) => {
								field.onChange(e.target.value);
							}}
							style={{ paddingInlineEnd: clearIconSpace ? "0.9375rem" : "revert-layer" }}
						/>
						{toogleMask && type === "password" ? (
							// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
							<i
								className={classNames("pi", showPassword ? "pi-eye-slash" : "pi-eye", "cursor-pointer")}
								onClick={togglePassword}
							/>
						) : (
							<i className={classNames("pi", iconEnd)} />
						)}

						<label htmlFor={field.name}>{label}</label>
					</span>
					{/* error label */}
					<label
						htmlFor={field.name}
						style={{ textWrap: "balance" }}
						className={classNames(
							"text-center",
							{
								"p-error": errorMessage || fieldState.error,
							},
							{ "text-xs": isMobile }
						)}
					>
						{getFormErrorMessage(field.name)}
					</label>
				</div>
			)}
		/>
	);
}
