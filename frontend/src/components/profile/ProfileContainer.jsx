import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import ProfileView from "./ProfileView.jsx";

const ProfileContainer = () => {
	const {
		user,
		updateProfile,
		changePassword,
		updateUsername,
		setPassword,
		updateUserState,
	} = useAuth();
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		username: "",
		currentPassword: "",
		newPassword: "",
	});
	const [message, setMessage] = useState({ text: "", type: "" });
	const [loading, setLoading] = useState(false);

	const [newSetPassword, setNewSetPassword] = useState("");
	const [setPasswordMsg, setSetPasswordMsg] = useState({ text: "", type: "" });

	useEffect(() => {
		if (user) {
			setFormData((prev) => ({
				...prev,
				firstName: user.firstName || "",
				lastName: user.lastName || "",
				username: user.username || "",
			}));
		}
	}, [user]);

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleProfileUpdate = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage({ text: "", type: "" });
		try {
			await updateProfile({
				firstName: formData.firstName,
				lastName: formData.lastName,
			});
			setMessage({ text: "Perfil actualizado correctamente", type: "success" });
		} catch (error) {
			setMessage({
				text: error.response?.data?.message || "Error al actualizar perfil",
				type: "error",
			});
		}
		setLoading(false);
	};

	const handleUsernameUpdate = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage({ text: "", type: "" });
		try {
			await updateUsername(formData.username);
			setMessage({
				text: "Username actualizado correctamente",
				type: "success",
			});
		} catch (error) {
			setMessage({
				text: error.response?.data?.message || "Error al actualizar username",
				type: "error",
			});
		}
		setLoading(false);
	};

	const handlePasswordChange = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage({ text: "", type: "" });
		try {
			await changePassword({
				currentPassword: formData.currentPassword,
				newPassword: formData.newPassword,
			});
			setMessage({
				text: "Contraseña actualizada correctamente",
				type: "success",
			});
			setFormData((prev) => ({
				...prev,
				currentPassword: "",
				newPassword: "",
			}));
		} catch (error) {
			setMessage({
				text: error.response?.data?.message || "Error al cambiar contraseña",
				type: "error",
			});
		}
		setLoading(false);
	};

	const handleSetPassword = async (e) => {
		e.preventDefault();
		setSetPasswordMsg({ text: "", type: "" });
		try {
			const response = await setPassword({ newPassword: newSetPassword });
			setSetPasswordMsg({
				type: "success",
				text: "Contraseña establecida correctamente. Actualizando...",
			});
			setNewSetPassword("");

			// Wait 2 seconds before updating global state to show success message
			setTimeout(() => {
				if (response.data.user) {
					updateUserState(response.data.user);
				}
			}, 2000);
		} catch (error) {
			setSetPasswordMsg({
				type: "error",
				text:
					error.response?.data?.message || "Error al establecer contraseña.",
			});
		}
	};

	return (
		<ProfileView
			formData={formData}
			message={message}
			loading={loading}
			handleChange={handleChange}
			handleProfileUpdate={handleProfileUpdate}
			handleUsernameUpdate={handleUsernameUpdate}
			handlePasswordChange={handlePasswordChange}
			handleNavigate={navigate}
			userHasPassword={user?.hasPassword}
			setPasswordMsg={setPasswordMsg}
			handleSetPassword={handleSetPassword}
			newSetPassword={newSetPassword}
			setNewSetPassword={setNewSetPassword}
		/>
	);
};

export default ProfileContainer;
