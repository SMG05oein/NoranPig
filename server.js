const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT||3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Google Sheets API 설정
const credentials = require('./credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const auth = new google.auth.GoogleAuth({
    keyFile: './credentials.json',
    scopes: SCOPES,
});

const sheets = google.sheets({ version: 'v4', auth });

// 스프레드시트 ID
const SHEET_ID = '1mQFhQA3YokfaG0_kj4HleNC08s4pa6ZJ1QYR1Cb9FQo'; // Google 스프레드시트 ID 입력

// POST API 엔드포인트
app.post('/recordWorkHours', async (req, res) => {
    const { name, startTime, endTime, workHours } = req.body;

    if (!name || !startTime || !endTime || !workHours) {
        console.error('필드 누락: ', req.body);
        return res.status(400).json({ success: false, message: '모든 필드를 입력해야 합니다.' });
    }

    try {
        // Google Sheets에 데이터 추가
        await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: 'Sheet1!A1',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[name, startTime, endTime, workHours]],
            },
        });

        res.json({ success: true, message: '근무 시간이 기록되었습니다.' });
    } catch (error) {
        console.error('Google Sheets API 오류:', error.message);
        res.status(500).json({ success: false, message: 'Google Sheets 기록 중 오류가 발생했습니다.' });
    }
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT}에서 실행 중입니다.`);
});

