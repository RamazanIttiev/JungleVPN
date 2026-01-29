import * as fs from 'node:fs';
import * as process from 'node:process';
import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { Advertisement } from './analytics.model';

const scopes = ['https://www.googleapis.com/auth/spreadsheets'];
const credentials = JSON.parse(fs.readFileSync('credentials.json', 'utf8'));

@Injectable()
export class AnalyticsService {
  async addData(data: Advertisement) {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes,
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const values = [data.channel, data.userId, data.dateAndTime];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${process.env.GOOGLE_SHEET_TITLE}!A2`,
      valueInputOption: 'RAW',
      requestBody: { values: [values] },
    });
  }
}
