<template>
	<dialog
		id='notesDialog'
		class='notesDialog glassmorphism'
	>
		<header>
			<h3 id='noteTitle' class='title text-2xl'>Notes</h3>
			<button id='closeNotesButton'>X</button>
		</header>

		<form id='notesForm'>
			<textarea
				id='notesTextarea'
				aria-label='Insert Note'
				placeholder='Insert Note'></textarea>
			<button id='saveNotesButton'>Save</button>
		</form>

		<footer>
			<ul id='notesList'>
				<li>No Notes</li>
			</ul>
		</footer>
	</dialog>
</template>

<script setup>
	import { ref, onMounted } from 'vue';

	// Move DOM manipulation into onMounted hook
	onMounted(() => {
		const notesDialog = document.getElementById('notesDialog');
		const notesList = document.getElementById('notesList');
		const closeNotesButton = document.getElementById('closeNotesButton');
		closeNotesButton.addEventListener('click', () => {
			console.log('closeNotesButton clicked');
			notesDialog.close();
			notesList.innerHTML = `<li>No Notes</li>`;
		});

		const notesForm = document.getElementById('notesForm');
		notesForm.addEventListener('submit', async (event) => {
			event.preventDefault();
			console.log('notesForm submitted');
			const entry = document.getElementById('notesTextarea').value;
			const id = notesDialog.getAttribute('data-player-id');
			const dateTime = new Date().toISOString();
		});
	});
</script>

<style>
	.notesDialog {
		max-width: 73ch;
		width: 80%;
		background-color: var(--color-secondary);
		color: var(--font-color);
		border-radius: 0.5rem;
	}

	.notesDialog::backdrop {
		background-color: rgba(0, 0, 0, 0.75);
		backdrop-filter: blur(10px);
	}

	.notesDialog header {
		padding: 0 1em;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.notesDialog header .title {
		margin: 0;
		font-size: 1.25em;
	}
	.notesDialog header button {
		margin: 0.5em 0;
	}
	#notesForm {
		align-items: self-end;
		display: flex;
		flex-direction: column;
		gap: 1em;
		padding: 1em;
	}
	button {
		margin-bottom: 0;
	}
</style>
