const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sql = require('mssql');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const config = {
  user: 'himanshu',
  password: '130996',
  server: '10.1.3.160',
  database: 'Orders_db',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    connectTimeout: 60000,
  },
};

app.get('/api/fetchSubmittedData', async (req, res) => {
  try {
    await sql.connect(config);

    const result = await sql.query`use Orders_db
    SELECT * FROM OrderData`;

    const submittedData = result.recordset;
    res.status(200).json({ submittedData })
  } catch (error) {
    console.error('Error Fetching Submitted data:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  } finally {
    await sql.close();
  }
});

app.post('/api/submitFormData', async (req, res) => {
  const { fullName, articleCode, color, size, quantity } = req.body;


  const scanDate = new Date().toISOString().split('T')[0];
  const currentTime = new Date();
  const options = { hour12: true, timeZone: 'Asia/Kolkata' };
  const formattedTime = currentTime.toLocaleTimeString('en-US', options).slice(0, 8);
  const scanTime = formattedTime;

  try {
    await sql.connect(config);


    const result = await sql.query`INSERT INTO OrderData (Name, ArticleCode, Color, Size, Quantity, Date, Time) 
      VALUES (${fullName}, ${articleCode}, ${color}, ${size}, ${quantity}, ${scanDate}, ${scanTime})`;

    console.log('Form data inserted:', result);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error inserting form data:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await sql.close();
  }
});

app.post('/api/UpdateData/:id', async (req, res) => {
  const { id } = req.params;
  const { Updated } = req.body;

  try {
    await sql.connect(config);

    const result = await sql.query`
        UPDATE OrderData
        SET Updated = ${Updated}
        WHERE Id = ${id};
     `;

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await sql.close();
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
