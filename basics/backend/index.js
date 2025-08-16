import express from 'express';

const app = express();


app.get('/', (req, res) => {
  res.send('Server is ready');
});

// get a list of jokes
app.get('/api/jokes', (req, res) => {
  const jokes = [
    {
      id: 1,
      title: 'Programmer Joke',
      content: "Why do programmers prefer dark mode? Because light attracts bugs."
    },
    {
      id: 2,
      title: 'SQL Joke',
      content: "A SQL query walks into a bar, walks up to two tables, and asks: “Can I join you?” "
    },
    {
      id: 3,
      title: 'Skeleton Joke',
      content: "Why don't skeletons fight each other? They don't have the guts."
    },
    {
      id: 4,
      title: 'Alphabet Joke',
      content: "I only know 25 letters of the alphabet… I don't know Y."
    },
    {
      id: 5,
      title: 'Parallel Lines',
      content: "Parallel lines have so much in common. It's a shame they'll never meet."
    }
  ];

  res.json(jokes);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
