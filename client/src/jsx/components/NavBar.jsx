import FlexBetween from "@components/FlexBetween";
import { Close, DarkMode, Help, LightMode, Menu, Message, Notifications, Search } from "@mui/icons-material";
import {
	Box,
	FormControl,
	IconButton,
	InputBase,
	MenuItem,
	Select,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { clearCredentials } from "@store/slices/authSlice";
import { setMode } from "@store/slices/globalSlice";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function NavBar() {
	const [isMobileMenuToggled, setIsMobileMenuToggled] = useState(false);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const user = useSelector((state) => state.store.auth.user);
	const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");

	const theme = useTheme();
	const neutralLight = theme.palette.primary.light;
	const dark = theme.palette.primary.light;
	const background = theme.palette.background.default;
	const primaryLight = theme.palette.primary.light;
	const alt = theme.palette.background.alt;
	const isDarkMode = theme.palette.mode === "dark";
	const fullName = `${user?.firstName} ${user?.lastName}`;

	return (
		<FlexBetween padding="1rem 6%" backgroundColor={alt}>
			<FlexBetween gap="1.75rem">
				<Typography
					fontWeight="bold"
					fontSize="clamp(1rem, 2rem, 2.25rem)"
					color="primary"
					onClick={() => navigate("/home")}
					sx={{
						"&:hover": {
							color: primaryLight,
							cursor: "pointer",
						},
					}}
				>
					Sociopedia
				</Typography>
				{user?.picturePath ? (
					<img src={import.meta.env.VITE_SERVER_URL + "/" + user?.picturePath} alt="User" />
				) : (
					<img src="https://i.imgur.com/OirnA4S.png" alt="User" />
				)}
				{isNonMobileScreens && (
					<FlexBetween backgroundColor={neutralLight} borderRadius="9px" gap="3rem" padding="0.1rem 1.5rem">
						<InputBase placeholder="Search..." />
						<IconButton>
							<Search />
						</IconButton>
					</FlexBetween>
				)}
			</FlexBetween>

			{/* DESKTOP NAV */}
			{isNonMobileScreens ? (
				<FlexBetween gap="2rem">
					<IconButton onClick={() => dispatch(setMode())}>
						{isDarkMode ? (
							<DarkMode sx={{ fontSize: "25px" }} />
						) : (
							<LightMode sx={{ color: dark, fontSize: "25px" }} />
						)}
					</IconButton>
					<Message sx={{ color: isDarkMode ? "white" : "dark", fontSize: "25px" }} />
					<Notifications sx={{ color: isDarkMode ? "white" : "dark", fontSize: "25px" }} />
					<Help sx={{ color: isDarkMode ? "white" : "dark", fontSize: "25px" }} />
					<FormControl variant="standard" value={fullName}>
						<Select
							value={fullName}
							sx={{
								backgroundColor: neutralLight,
								width: "150px",
								borderRadius: "0.25rem",
								p: "0.25rem 1rem",
								"& .MuiSvgIcon-root": {
									pr: "0.25rem",
									width: "3rem",
								},
								"& .MuiSelect-select:focus": {
									backgroundColor: neutralLight,
								},
							}}
							input={<InputBase />}
						>
							<MenuItem value={fullName}>
								<Typography>{fullName}</Typography>
							</MenuItem>
							<MenuItem onClick={() => dispatch(clearCredentials())}>Log Out</MenuItem>
						</Select>
					</FormControl>
				</FlexBetween>
			) : (
				<IconButton onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}>
					<Menu />
				</IconButton>
			)}

			{/* MOBILE NAV */}
			{!isNonMobileScreens && isMobileMenuToggled && (
				<Box
					position="fixed"
					right="0"
					bottom="0"
					height="100%"
					zIndex="10"
					maxWidth="500px"
					minWidth="300px"
					backgroundColor={background}
				>
					{/* CLOSE ICON */}
					<Box display="flex" justifyContent="flex-end" p="1rem">
						<IconButton onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}>
							<Close />
						</IconButton>
					</Box>

					{/* MENU ITEMS */}
					<FlexBetween
						display="flex"
						flexDirection="column"
						justifyContent="center"
						alignItems="center"
						gap="3rem"
					>
						<IconButton onClick={() => dispatch(setMode())} sx={{ fontSize: "25px" }}>
							{isDarkMode ? (
								<DarkMode sx={{ fontSize: "25px" }} />
							) : (
								<LightMode sx={{ color: dark, fontSize: "25px" }} />
							)}
						</IconButton>
						<Message sx={{ color: isDarkMode ? "white" : "dark", fontSize: "25px" }} />
						<Notifications sx={{ color: isDarkMode ? "white" : "dark", fontSize: "25px" }} />
						<Help sx={{ color: isDarkMode ? "white" : "dark", fontSize: "25px" }} />
						<FormControl variant="standard" value={fullName}>
							<Select
								value={fullName}
								sx={{
									backgroundColor: neutralLight,
									width: "150px",
									borderRadius: "0.25rem",
									p: "0.25rem 1rem",
									"& .MuiSvgIcon-root": {
										pr: "0.25rem",
										width: "3rem",
									},
									"& .MuiSelect-select:focus": {
										backgroundColor: neutralLight,
									},
								}}
								input={<InputBase />}
							>
								<MenuItem value={fullName}>
									<Typography>{fullName}</Typography>
								</MenuItem>
								<MenuItem onClick={() => dispatch(clearCredentials())}>Log Out</MenuItem>
							</Select>
						</FormControl>
					</FlexBetween>
				</Box>
			)}
		</FlexBetween>
	);
}
