<template>

	<button class='notesButton hide'>
		<i class="fi fi-ss-notebook"></i>
		<span>Notes</span>
	</button>

	<dialog
		id='notesDialog'
		class='notesDialog glassmorphism'
	>
		<header>
			<h3 id='noteTitle' class='title text-2xl'>Notes</h3>
			<button id='closeNotesButton' @click="closeDialog">X</button>
		</header>

		<div id='notesFormContainer'>

			<form id='notesForm' method="post">
				<textarea
					id='notesTextarea'
					v-model="entry"
					aria-label='Insert Note'
					placeholder='Insert Note'></textarea>
				<button id='saveNotesButton' @submit.prevent="addNote">Save</button>
			</form>

		<footer>
			<ul id='notesList'><li>No notes</li></ul>
		</footer>
		</div>
	</dialog>

</template>

<script>
  import data from '../../data/playerNotes.json';

	console.log(data);

  export default {
		name: 'NotesForm',
		props: {
			playersSteam: {
				type: String,
				required: true
			}
		},
    data() {
      return {
				entry: '',
				notes: data,
				playerID: this.playersSteam,
      };
    },

		methods: {
			async addNote(e) {
				e.preventDefault();
				const newNote = {
					id: this.playersSteam,
					entry: this.entry,
					date: new Date().toISOString(),
				};
				
				try {
					const response = await fetch('data/api/saveNote.js', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(newNote)
					});

					if (!response.ok) {
						throw new Error('Failed to save note');
					}

					this.notes.push(newNote);
					this.entry = '';

				} catch (error) {
					console.error('Error saving note:', error);
				}
				
				return false;
			}
		},
  };
</script>

<style>
	.notesDialog {
		max-width: 73ch;
		width: 80%;
		background-color: var(--color-secondary);
		color: var(--font-color);
		border-radius: 0.5rem;
	}
	.notesDialog form {
		align-items: self-end;
		display: flex;
		flex-direction: column;
		gap: 1em;
		padding: 1em;
	}
	.notesDialog::backdrop {
		background-color: rgba(0, 0, 0, 0.5);
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
	form {
		align-items: self-end;
		display: flex;
		flex-direction: column;
		gap: 1em;
		padding: 0 0 1em 0;
	}
	button {
		margin-bottom: 0;
	}
</style>