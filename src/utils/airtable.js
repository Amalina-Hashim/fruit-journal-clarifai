import Airtable from "airtable";

const apiKey = process.env.REACT_APP_AIRTABLE_API_KEY;
const baseId = process.env.REACT_APP_AIRTABLE_BASE_ID;

if (!apiKey || !baseId) {
  throw new Error("Airtable API key or base ID is missing from environment variables.");
}

const base = new Airtable({ apiKey }).base(baseId);

export async function createNote(noteData, cloudUrl) {
  try {
    let labelsString = "";
    if (Array.isArray(noteData.labels)) {
      labelsString = noteData.labels.join(',');
    } else if (typeof noteData.labels === 'string') {
      labelsString = noteData.labels;
    }

    const attachments = [];
    if (noteData.image) {
      attachments.push({
        url: `data:image/png;base64,${noteData.image}`,
      });
    }

    const createdRecord = await base('Notes').create([
      {
        fields: {
          title: noteData.title,
          content: noteData.content,
          labels: labelsString,
          image: attachments,
          cloudUrl: noteData.cloudUrl,  
          location: noteData.location,
        }
      }
    ]);

    return createdRecord[0]; 
  } catch (error) {
    throw new Error("Error creating note in Airtable: " + error.message);
  }
}



export async function getAllNotes() {
  try {
    const records = await base("Notes").select({
      view: "Grid view", 
    }).all();
    return records;
  } catch (error) {
    throw new Error("Error fetching notes from Airtable: " + error.message);
  }
}


export async function deleteNoteById(noteId) {
  try {
    await base("Notes").destroy(noteId);
    return true;
  } catch (error) {
    throw new Error("Error deleting note from Airtable: " + error.message);
  }
}
