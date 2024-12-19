<template>
	<form id='notesForm' :data-player-id='playerID' @submit.prevent="addNote" method="post">
		<textarea
			id='notesTextarea'
			v-model="entry"
			aria-label='Insert Note'
			placeholder='Insert Note'></textarea>
		<button id='saveNotesButton' type="submit" >Save</button>
	</form>

  <footer>
    <ul id='notesList'></ul>
  </footer>
</template>

<script>
  import data from '../data2/playerNotes.json';
	console.log(data);

  export default {
		name: 'NotesForm',
		props: {
			playerID: {
				type: String,
				required: true
			}
		},
    data() {
      return {
				entry: '',
				notes: data,
				playerID: this.playerID,
      };
    },
		methods: {
			addNote(e) {
				e.preventDefault();
				console.log('saveNoteToDatabase');
        const newNote = {
          id: this.playerID, 
          entry: this.entry,  
          date: new Date().toISOString(),
        };
				console.log('newNote', newNote);
				this.notes.push(newNote);
				this.entry = '';
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
