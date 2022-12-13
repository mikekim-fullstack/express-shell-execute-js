const express = require('express')

var shell = require('shelljs');
var fs = require('fs');


const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// app.get('/', (req, res) => {
//     res.send('<h1>Welcome to LaLaSol JS Shell Server</h1>')
// })
app.get('/', (req, res) => {
    const jscode = req.body['js-code']//JSON.parse(req.body)
    console.log(req.body, jscode)
    if (jscode) {
        if (!req.body.user || !req.body.id) return res.send('error: bad data')
        const fileName = `${req.body.user}-${req.body.id}.js`
        fs.writeFile(fileName, jscode, function (err) {
            if (err) {
                console.log('error: ', err)
                res.send(JSON.stringify(err))
                return;
            }
            console.log('Saved!');

            const output = shell.exec(`node ${fileName}`, function (code, stdout, stderr) {
                console.log('Exit code:', code);
                if (code == 0) {
                    res.send(stdout)
                    console.log('Program output:', stdout);
                }
                else if (code == 1) {
                    console.log('Program stderr:', stderr);
                    res.send(stderr)
                }
                fs.unlink(fileName, function (err) {
                    if (err) throw err;
                    console.log('File deleted!');
                });
            });
        })

    }


})
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server runs on port ${PORT}`))
