import app from './app';

app.use('/', (req, res) => res.send('Thanks for using this boilerplate :)'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
