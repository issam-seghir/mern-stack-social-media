import AdvertWidget from "@components/AdvertWidget";
import FriendListWidget from "@components/FriendListWidget";
import MyPostWidget from "@components/MyPostWidget";
import Navbar from "@components/NavBar";
import { Box, useMediaQuery } from "@mui/material";
import { useSelector } from "react-redux";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import { AlgoliaSearchBar } from "@components/AlgoliaSearchBar";

export const Home = () => {
	const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
	const { id, picturePath, fullName } = useSelector((state) => state.store.auth.user);
	return (
		<Box>
			<AlgoliaSearchBar />

			<Box
				width="100%"
				padding="2rem 6%"
				display={isNonMobileScreens ? "flex" : "block"}
				gap="0.5rem"
				justifyContent="space-between"
			>
				<Box flexBasis={isNonMobileScreens ? "26%" : undefined}>
				</Box>
				<Box flexBasis={isNonMobileScreens ? "42%" : undefined} mt={isNonMobileScreens ? undefined : "2rem"}>
					{/* <MyPostWidget picturePath={picturePath} /> */}
				</Box>
				{isNonMobileScreens && (
					<Box flexBasis="26%">
						<AdvertWidget />
						<Box m="2rem 0" />
						<FriendListWidget userId={id} />
					</Box>
				)}
			</Box>
		</Box>
	);
};
