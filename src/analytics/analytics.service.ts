import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class AnalyticsService {
  private sheets;

  constructor() {
    const auth = new google.auth.GoogleAuth({
      apiKey: 'af22667f8b62815a56ecaff2edfd3c3740b07115',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    this.sheets = google.sheets({ version: 'v4', auth });
  }

  async appendRow(values: (string | number)[]) {
    try {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: process.env.SHEETS_ID!,
        range: 'Polls!A:D',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [values] },
      });
      console.log(`✅ Row appended to Google Sheets`);
    } catch (error) {
      console.error('❌ Failed to append to Google Sheets', error);
    }
  }
}
