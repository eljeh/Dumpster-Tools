<template>
	<form id='notesForm' :data-playersSteam='playersSteam' @submit.prevent="addNote" method="post">
		<textarea
			id='notesTextarea'
			v-model="entry"
			aria-label='Insert Note'
			placeholder='Insert Note'></textarea>
		<button id='saveNotesButton' type="submit" >Save</button>
	</form>

  <footer>
    <ul id='notesList'><li>No notes</li></ul>
  </footer>
</template>

<script>
  import data from '../../data/playerNotes.json';
	console.log('data ',data);
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
      };
    },
		methods: {
			async addNote(e) {
				e.preventDefault();
				
				const currentPlayersSteam = e.target.dataset.playerssteam;

				console.log('Adding note for player:', currentPlayersSteam);
				
				const newNote = {
					id: currentPlayersSteam,
					date: new Date().toISOString(),
					entry: this.entry,
				};
				
				console.log('New note data:', newNote);
				
				try {
					console.log('Sending POST request to saveNote.js');
					console.log('notes: ', this.notes)
					const response = await fetch('./data/api1/saveNote.js', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(newNote)
					});

					console.log('Response status:', response.status);

					if (!response.ok) {
						throw new Error('Failed to save note');
					}

					console.log('Note saved successfully', newNote);

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
		background-color: var(--color-accent);
		color: var(--font-color);
		border-radius: 0.5rem;
	}

	.notesDialog::backdrop {
		background-color: rgba(0, 0, 0, 0.5);
		filter: blur(10px);
	}
	.notesDialog form {
		align-items: self-end;
		display: flex;
		flex-direction: column;
		gap: 1em;
		padding: 1em;
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

	button {
		margin-bottom: 0;
	}
</style>
