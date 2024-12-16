export async function POST({ request }) {
  const fs = require('node:fs');
  const data = await request.json();
  console.log('data', data);
  try {
    const playerNotes = JSON.parse(
      fs.readFileSync('../playerNotes.json', 'utf8')
    );
    playerNotes.push(data);
    fs.writeFileSync(
      '../playerNotes.json',
      JSON.stringify(playerNotes, null, 2)
    );
    console.log('sending');
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}