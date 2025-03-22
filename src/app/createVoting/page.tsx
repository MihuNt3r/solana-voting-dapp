'use client';

import { useState } from "react";
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
	const { initializePoll } = useSolanavotingdappProgram()
	const router = useRouter()

	const addOption = () => {
		if (newOption.trim() && !options.includes(newOption)) {
			setOptions([...options, newOption]);
			setNewOption("");
		}
	};

	const removeOption = (option: string) => {
		setOptions(options.filter((o) => o !== option));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

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

				<Box display="flex" gap={2} mt={2}>
					<TextField
						label="Option"
						fullWidth
						variant="outlined"
						value={newOption}
						onChange={(e) => setNewOption(e.target.value)}
					/>
					<Button
						variant="contained"
						color="primary"
						onClick={addOption}
						startIcon={<AddIcon />}
					>
						Add
					</Button>
				</Box>

				<List>
					{options.map((option, index) => (
						<div className='border'>
							<ListItem
								key={index}
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

				<Box display="flex" justifyContent="center" mt={3}>
					<Button variant="contained" type="submit" size="large" disabled={loading}>
						{loading ? <CircularProgress size={24} /> : "Create Voting"}
					</Button>
				</Box>
			</form >
		</Box >
	);
}
