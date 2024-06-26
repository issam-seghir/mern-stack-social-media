import { FileUploadDialog } from "@components/FileUploadDialog";
import { PFormTextField } from "@components/Form/PFormTextField";
import { isDev } from "@data/constants";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import { PFormAutoCompleteContries } from "@jsx/components/Form/PFormAutoCompleteContries";
import { PhotosPreview } from "@jsx/components/PhotosPreview";
import { useUpdateUserProfileMutation } from "@jsx/store/api/userApi";
import { userProfileSchema } from "@validations/userSchema";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { Image } from "primereact/image";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { convertModelToFormData } from "../utils/index";
import { PFormTextAreaField } from "./Form/PFormTextAreaField";

export function EditProfileDialog({ showDialog, setShowDialog }) {
	const navigate = useNavigate();
	const toast = useRef(null);
	// const showDialog = useSelector(selectPostDialogForm);
	const dispatch = useDispatch();
	const { profileId } = useParams();
	const [updateUserProfile, updateUserProfileResult] = useUpdateUserProfileMutation();
	const [existingImages, setExistingImages] = useState([]);

	const {
		handleSubmit,
		watch,
		reset,
		setValue,
		getValues,
		resetField,
		control,
		formState: { errors: errorsForm, isSubmitting },
	} = useForm({
		mode: "onChange",
		resolver: zodResolver(userProfileSchema),
	});
	console.log(showDialog?.data);

	useEffect(() => {
		if (showDialog?.data) {
			// const { images, ...postToEditWithoutImages } = showDialog.data;
			// reset(postToEditWithoutImages);
			reset(showDialog.data);
			// setExistingImages(images);

			// setExistingImages([]);
		}
	}, [showDialog.data, reset]);
	const errorMessage = updateUserProfileResult?.isError ? updateUserProfileResult?.error : errorsForm;

	const getFormErrorMessage = (name) => {
		if (errorMessage[name]) {
			// Check if the error message is an array
			return Array.isArray(errorMessage[name]) ? (
				errorMessage[name].map(
					(error, index) =>
						error && (
							<small key={index} className="p-error">
								* {error.message}
							</small>
						)
				)
			) : (
				<small className="p-error">* {errorMessage[name].message}</small>
			);
		} else if (errorMessage?.data?.field === name) {
			// server error
			return <small className="p-error">* {errorMessage?.data?.message}</small>;
		}
	};

	async function handleUpdateUserProfile(data) {
		try {
			const newData = { ...data, existingImages: existingImages };
			console.log(newData);

			// Convert data to FormData
			const formData = convertModelToFormData(newData);
			// Log FormData
			for (let pair of formData.entries()) {
				console.log(pair[0] + ", " + pair[1]);
			}

			let res = null;
			res = await updateUserProfile({ id: profileId, data: formData }).unwrap();

			if (res) {
				reset();

				setShowDialog({ open: false, data: showDialog.data });
				toast.current.show({
					severity: "success",
					summary: "Profile Updated 🎉",
					position: "top-center",
					detail: "Your Profile has been Updated successfully",
				});
			}
		} catch (error) {
			console.error(error);
			toast.current.show({
				severity: "error",
				position: "top-center",
				summary: "Error",
				detail: error?.data?.message || "Failed to Updated your Profile",
			});
		}
	}

	const onSubmit = (data) => {
		handleUpdateUserProfile(data);
	};

	const images = watch("images");

	// create new post dialog Actions Handlers
	const handleMediaOpen = () => {
		setShowFileUploadDialog(true);
	};

	const values = getValues(); // You can get all input values
	console.log(values);

	const onPhotoRemove = (photo) => {
		if (existingImages.length > 0 && existingImages.includes(photo)) {
			// Remove image from existing images (server image path)
			const updatedExistingImages = existingImages.filter((image) => image !== photo);
			setExistingImages(updatedExistingImages);
		} else {
			// Remove image from images (client image object)
			const updatedPhotos = images.filter((image) => image.name !== photo.name);
			setValue("images", updatedPhotos, { shouldValidate: true });
		}
	};

	const [showFileUploadDialog, setShowFileUploadDialog] = useState(false);

	return (
		<>
			{/* react hook form dev tool  */}
			{isDev && <DevTool control={control} placement="top-left" />}
			<Toast ref={toast} />
			{/* Create New Post Form Dialog */}
			<Dialog
				key={`${showDialog.data?.id}`}
				header={<h2 className="text-center">{"Update Profile"}</h2>}
				visible={showDialog.open}
				style={{ width: "40%" }}
				contentStyle={{ overflowY: "auto", maxHeight: "40%" }}
				contentClassName="pt-5"
				breakpoints={{ "960px": "75vw", "640px": "90vw" }}
				onHide={() => {
					setShowDialog({ open: false, data: showDialog.data });
					reset();
					// setExistingImages(postToEdit?.images);
				}}
				draggable={false}
				dismissableMask={!isSubmitting && !updateUserProfileResult?.isLoading}
				closeOnEscape={!isSubmitting && !updateUserProfileResult?.isLoading}
				footer={
					<>
						{/* Edit Profile Actions */}
						<div className="flex m-2 gap-2">
							<Button
								label="Media"
								icon="pi pi-image"
								iconPos="left"
								className="p-button-text"
								onClick={handleMediaOpen}
							/>
							<FileUploadDialog
								control={control}
								images={images}
								existingImages={existingImages}
								resetField={resetField}
								onPhotoRemove={onPhotoRemove}
								showFileUploadDialog={showFileUploadDialog}
								setShowFileUploadDialog={setShowFileUploadDialog}
							/>
						</div>
						<Divider />
						<Button
							type="submit"
							label={updateUserProfileResult?.isLoading ? "Updatting ..." : "Update Profile"}
							className="w-full"
							iconPos="right"
							loading={isSubmitting || updateUserProfileResult?.isLoading}
							onClick={handleSubmit(onSubmit)}
						/>
					</>
				}
			>
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="formgrid grid">
						<div>
							<Image
								className="cover h-18rem w-full"
								imageClassName="border-round-md z-0"
								src={showDialog?.data?.coverPath}
								alt="Cover"
								preview
							/>
							<div className="flex flex-column mb-6">
								<div className="flex align-items-start px-4 justify-content-between pt-3">
									<div className="z-4">
										<Avatar
											size="large"
											icon="pi pi-user"
											className="p-overlay border-0 border-circle"
											style={{
												minWidth: "48px",
												width: "35%",
												height: "auto",
												marginTop: "-23%",
												border: "1rem red solid",
											}}
											image={showDialog?.data?.picturePath}
											// onClick={() => imgPrevRef.current.show()}
											alt={showDialog?.data?.fullName}
											shape="circle"
										/>
										<Image
											// ref={imgPrevRef}
											src={showDialog?.data?.picturePath}
											alt="Avatar"
											preview
											style={{ visibility: "hidden", height: 0 }}
										/>
									</div>
								</div>
							</div>
						</div>
						<div className="field col-12 md:col-6">
							<PFormTextField
								control={control}
								name={"firstName"}
								label="First Name"
								size={"lg"}
								iconStart={"pi-user"}
								errorMessage={errorMessage}
							/>
						</div>
						<div className="field col-12 md:col-6">
							<PFormTextField
								control={control}
								name={"lastName"}
								label="Last Name"
								size={"lg"}
								iconStart={"pi-user"}
								errorMessage={errorMessage}
							/>
						</div>
						<div className="field col-12">
							<PFormTextAreaField
								control={control}
								name={"bio"}
								placeholder="Your Bio ..."
								fullWidth
								errorMessage={errorMessage}
							/>
						</div>
						<div className="field col-12 md:col-6">
							<PFormTextField
								control={control}
								name={"job"}
								label="Job"
								size={"lg"}
								iconStart={"pi-briefcase"}
								errorMessage={errorMessage}
							/>
						</div>
						<div className="field col-12 md:col-6">
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
						</div>
					</div>

					{/* Photos Preview */}
					{/* error label */}
					{getFormErrorMessage("images")}
					{(images?.length > 0 || existingImages?.length > 0) && (
						<PhotosPreview
							photos={images}
							existingImages={existingImages}
							onPhotoRemove={onPhotoRemove}
							disabled={isSubmitting || updateUserProfileResult?.isLoading}
						/>
					)}
				</form>
			</Dialog>
		</>
	);
}
