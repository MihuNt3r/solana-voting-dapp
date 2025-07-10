'use client';

import { useEffect, useState } from "react";
import {
	Button,
	TextField,
	Paper,
	Typography,
	Box,
	List,
	ListItem,
	ListItemText,
	IconButton,
	CircularProgress,
} from "@mui/material";
import { useSolanavotingdappProgram } from '@/components/solanavotingdapp/solanavotingdapp-data-access';
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useRouter } from 'next/navigation';

export default function Page() {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [options, setOptions] = useState<string[]>([]);
	const [newOption, setNewOption] = useState("");
	const [loading, setLoading] = useState(false);
	const [showError, setShowError] = useState(false);
	const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
	const { initializePoll } = useSolanavotingdappProgram()
	const router = useRouter()

	useEffect(() => {
		if (hasAttemptedSubmit) {
			setShowError(
				options.length < 2 ||
				options.length > 10 ||
				getUtf8ByteLength(title) > 32 ||
				getUtf8ByteLength(description) > 280
			);
		}
	}, [options, hasAttemptedSubmit, title, description]);

	const addOption = () => {
		if (newOption.trim() && !options.includes(newOption)) {
			setOptions([...options, newOption]);
			setNewOption("");
		}
	};

	const removeOption = (option: string) => {
		setOptions(options.filter((o) => o !== option));
	};

	const getUtf8ByteLength = (str: string) => new TextEncoder().encode(str).length;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setHasAttemptedSubmit(true);

		// Check if the number of options is valid before proceeding
		if (options.length < 2 || options.length > 10 || title.length > 32 || description.length > 280) {
			setShowError(true);
			setLoading(false);
			return;
		}

		try {
			console.log("Starting creation of voting");

			await initializePoll.mutateAsync({
				pollName: title,
				pollDescription: description,
				candidates: options,
			});

			console.log("Created voting");
			router.push('/solanavotingdapp');
		} catch (error) {
			console.error("Error creating voting:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box minWidth="1000px" mx="auto" mt={4} p={3} component={Paper} elevation={3}>
			<Typography variant="h5" fontWeight="bold" gutterBottom>
				Create a New Voting
			</Typography>

			<form onSubmit={handleSubmit}>
				<TextField
					label="Title"
					fullWidth
					variant="outlined"
					margin="normal"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					required
				/>

				{showError && (getUtf8ByteLength(title) > 32) && (
					<Typography color="error" variant="body2" sx={{ mt: 1 }}>
						Title cannot exceed 32 bytes.
					</Typography>
				)}

				<TextField
					label="Description"
					fullWidth
					variant="outlined"
					margin="normal"
					multiline
					rows={3}
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					required
				/>

				{showError && (getUtf8ByteLength(description) > 280) && (
					<Typography color="error" variant="body2" sx={{ mt: 1 }}>
						Description cannot exceed 280 bytes.
					</Typography>
				)}

				<Box display="flex" gap={2} mt={2} alignItems="center">
					<TextField
						label="Option"
						fullWidth
						variant="outlined"
						value={newOption}
						onChange={(e) => setNewOption(e.target.value)}
						error={getUtf8ByteLength(newOption) > 32}
						helperText={
							<span style={{ visibility: getUtf8ByteLength(newOption) > 32 ? "visible" : "hidden" }}>
								Option cannot exceed 32 bytes
							</span>
						}
					/>
					<Button
						variant="contained"
						color="primary"
						onClick={addOption}
						startIcon={<AddIcon />}
						disabled={newOption.length > 32}
						sx={{ height: "56px", alignSelf: "flex-start" }}
					>
						Add
					</Button>
				</Box>

				<List>
					{options.map((option, index) => (
						<div className='border' key={index}>
							<ListItem
								secondaryAction={
									<IconButton edge="end" onClick={() => removeOption(option)}>
										<DeleteIcon color="error" />
									</IconButton>
								}
							>
								<ListItemText primary={option} />
							</ListItem>
						</div>
					))}
				</List>

				{/* Error message for invalid number of options */}
				{showError && (options.length < 2 || options.length > 10) && (
					<Typography color="error" variant="body2" sx={{ mt: 1 }}>
						Number of options must be between 2 and 10.
					</Typography>
				)}

				<Box display="flex" justifyContent="center" mt={3}>
					<Button variant="contained" type="submit" size="large" disabled={loading || (showError && (options.length < 2 || options.length > 10 || getUtf8ByteLength(title) > 32 || getUtf8ByteLength(description) > 280))}>
						{loading ? <CircularProgress size={24} /> : "Create Voting"}
					</Button>
				</Box>
			</form >
		</Box >
	);
}
