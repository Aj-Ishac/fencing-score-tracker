import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const SPREADSHEET_ID = '1Kx_h2xlYX3IJx_eEDyFMTm_eL6KQiJyoHYDNI55RBaA';
const CREDENTIALS = {
  client_email: "your-service-account@project.iam.gserviceaccount.com",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDm0YTdu+lPyqgO\nfSiQzLbT/nhubVWIFtDkf0H/q/vFn2kz5D8FkyZCUEhoMO3ncPGXr1keGhbRvXBW\nv3nf9q6CpQTt57OoLF65g5OZFbjuv+q8UD7/K4WiK/GbcgIFyBfe0bcSOsueB2Ts\nAgoFmD8lMjDXdsAj/ONnlP8dmWeL5nejHALWswth4/NvpkR+ePHLOaERop1cSts+\nqqbJ44oL3SdufgXBYTEKsNHKNhUvvewdPfHkjZYGuPMosGt6077+c6P0FI8MM0/q\n8mzCzzRB3XsDJEwpkqlAAP2FMcZwhU6YRbdV7o11UDl6cxsts/6fX1kVk0b/THnd\n3+e/r/k7AgMBAAECggEAOIBAOHD3tz8B7W4IwI1EEdfATjO4VLRVFSHrm3TTkDgp\n7fhozuoK2v/BAbQ8gEN++CUFuR8kx9nKBoofgMnnRPa1IrFtonSeCWZien49Q0A6\nazdvfFIAh8afAXCiexzUbwhB+pXm4vunYjhLkLwIdQf4ub2JYiXU2rW3z1yOYsmk\nFZ3BMDmNlGXz/5mtWNQ0W5eWBCJ7KqHhY9L83idFAZ53YH8nlCw3slvEIoBpxIeW\n0TIHb2jtGIplaj7Bs//4EaaZgEjHzFlDNbVT0N8f38vi6dDbX7Bn4a64Hv+fKSoV\nY5Mv4rVM5Zvr/Us97j9cjz+CHUWzLpSsBYfI8zb57QKBgQD8q5qRfQ/ZnxSLpsi0\njhQFri3OAkC50G2v332CJ/gHTZxycUhMoRunFqvJ57Kksoh5DbhYXQXL4wbMYkO9\ncG5u0mOAMDIGgcNOhXo3WlKnQwsR22YQWggJDD0E79gslcg946dZBJ6W5gTf3EDf\ncPLhi+FYLjUjmRzXtaz9U3nHxQKBgQDp3DJeMYAPD9petDKTyOPtDNurrmBHwiKR\nl83LFYfaVhcCgwORMeRgA/AeUy5v1/5yLa0d3etPJYwPtMPC6LjyJ+ta4Gur+Pug\nKsbhF8oyU1RLXfyXzDGlH6xbXZMDka5BeC+ZaxbC6hSAjx7dfeiakKeXXRcKNKHM\n76f7J33M/wKBgH5fLZ2amTTU1afLMRLtBKKarRoeElVdI58U/mb8qpasgJTUh76b\nzYLSWfVPxw+Mo6k37X10eROyZpIOi6bR9snCvDU+5aZPfGlnZOsOZ8x0QbMasn93\nKBGuZ05yzwHtoAskM2zYXKFIRiPYuzGGAlRAa+J4qec2CzDwEqdY+s2pAoGBANeG\nn0jeF+ZJtvgW3JIEz8KVWhJUR9l6Wn+RxxDGTAj11Ij1E6GJuK6gknhwMtjS2GaE\nIArpjkbIFNgYwV3tOx25mpeLQtAgTE6lfdrPIQLWd1ZqTTPc9Vf349HkYGwmo9Ek\nocGjxztlnfWJcWmx82AXtsyx91zpesCzkj3OfIsjAoGAHdT2R6Q25Whg3AYVGC46\ndyIgODP9q8FT0/uA3x4SNHU44As+IRJgFqGaSEXUMdzMsEWkMMF80vLne0gboGeJ\ny0a2iVBimHEgBP2Rcgng+ixXoo68MP1ad/bJKrpV8qisQtZRC00M55u1E/QxUQti\nRuqzV61Plru0v+RW9EU9psI=\n-----END PRIVATE KEY-----\n"
};

class GoogleSheetsService {
  constructor() {
    const serviceAccountAuth = new JWT({
      email: CREDENTIALS.client_email,
      key: CREDENTIALS.private_key.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      try {
        await this.doc.loadInfo();
        this.initialized = true;
      } catch (error) {
        console.error('Initialization error:', error);
        throw new Error('Failed to initialize Google Sheets: ' + error.message);
      }
    }
  }

  async getFencers() {
    await this.initialize();
    const sheet = this.doc.sheetsByTitle['Fencers'];
    const rows = await sheet.getRows();
    return rows.map(row => ({
      id: parseInt(row.id),
      name: row.name,
      age: parseInt(row.age),
      level: row.level,
      club: row.club
    }));
  }

  async addFencer(fencer) {
    await this.initialize();
    const sheet = this.doc.sheetsByTitle['Fencers'];
    await sheet.addRow({
      id: fencer.id.toString(),
      name: fencer.name,
      age: fencer.age.toString(),
      level: fencer.level,
      club: fencer.club
    });
  }

  async getBouts() {
    await this.initialize();
    const sheet = this.doc.sheetsByTitle['Bouts'];
    const rows = await sheet.getRows();
    return rows.map(row => ({
      id: parseInt(row.id),
      fencer1_id: parseInt(row.fencer1_id),
      fencer2_id: parseInt(row.fencer2_id),
      score1: parseInt(row.score1),
      score2: parseInt(row.score2),
      timestamp: row.timestamp,
      notes: row.notes
    }));
  }

  async addBout(bout) {
    await this.initialize();
    const sheet = this.doc.sheetsByTitle['Bouts'];
    await sheet.addRow({
      id: bout.id.toString(),
      fencer1_id: bout.fencer1_id.toString(),
      fencer2_id: bout.fencer2_id.toString(),
      score1: bout.score1.toString(),
      score2: bout.score2.toString(),
      timestamp: bout.timestamp,
      notes: bout.notes || ''
    });
  }

  async updateBout(boutId, updatedData) {
    await this.initialize();
    const sheet = this.doc.sheetsByTitle['Bouts'];
    const rows = await sheet.getRows();
    const boutRow = rows.find(row => parseInt(row.id) === boutId);
    if (boutRow) {
      Object.keys(updatedData).forEach(key => {
        boutRow[key] = updatedData[key].toString();
      });
      await boutRow.save();
    }
  }

  async deleteBout(boutId) {
    await this.initialize();
    const sheet = this.doc.sheetsByTitle['Bouts'];
    const rows = await sheet.getRows();
    const boutRow = rows.find(row => parseInt(row.id) === boutId);
    if (boutRow) {
      await boutRow.delete();
    }
  }
}

export const googleSheetsService = new GoogleSheetsService(); 